provider "google" {
  project = var.project
  region  = var.region
}

resource "google_storage_bucket" "tldd" {
  name     = var.pdf_bucket
  location = var.region
}

terraform {
  backend "gcs" {
    bucket = "tf-state-vertex-dashboards"
    prefix = "tldd"
  }
}

resource "google_artifact_registry_repository" "tldd" {
  provider = google
  format   = "DOCKER"
  location = var.region
  repository_id = "tldd"
  description   = "Artifact Registry for tldd"
  project = var.project
}

resource "google_secret_manager_secret" "resend_api_key" {
  secret_id = "resend-api-key"
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_iam_member" "resend_api_key_accessor" {
  secret_id = google_secret_manager_secret.resend_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_cloud_run_service.tldd.template[0].spec[0].service_account_name}"
}

resource "google_firestore_database" "tldd" {
  name     = "tldd"
  project  = var.project
  location_id = var.region
  type     = "FIRESTORE_NATIVE"
}

resource "google_cloud_run_service" "tldd" {
  name     = "tldd"
  location = var.region

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project}/tldd/tldd:${var.run_hash}"
        ports {
          container_port = 8000
        }
        env {
          name = "RESEND_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.resend_api_key.secret_id
              key  = "latest"
            }
          }
        }
        env {
          name  = "PDF_BUCKET"
          value = var.pdf_bucket
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }
}

resource "google_cloud_run_service_iam_member" "tldd_invoker" {
  service = google_cloud_run_service.tldd.name
  location = google_cloud_run_service.tldd.location
  role    = "roles/run.invoker"
  member  = "allUsers"
}
