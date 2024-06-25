provider "google" {
  project = var.project
  region  = var.region
}

resource "google_storage_bucket" "vertex-dashboards" {
  name     = "vertex-dashboards"
  location = var.region
}

terraform {
  backend "gcs" {
    bucket = "tf-state-vertex-dashboards"
    prefix = "vertex-dashboards"
  }
}

resource "google_artifact_registry_repository" "vertex-dashboards" {
  provider = google
  format   = "DOCKER"
  location = var.region
  repository_id = "vertex-dashboards"
  description   = "Artifact Registry for Vertex Dashboards"
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

resource "google_cloud_run_service" "vertex_dashboards" {
  name     = "vertex-dashboards"
  location = var.region

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/vertex-dashboards/vertex-dashboards/vertex-dashboards:${var.run_hash}"
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

resource "google_cloud_run_service_iam_member" "vertex_dashboards_invoker" {
  service = google_cloud_run_service.vertex_dashboards.name
  location = google_cloud_run_service.vertex_dashboards.location
  role    = "roles/run.invoker"
  member  = "allUsers"
}
