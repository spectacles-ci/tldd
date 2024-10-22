variable "project" {
  description = "The project ID to deploy to"
  type        = string
}

variable "region" {
  description = "The region to deploy to"
  type        = string
}

variable "run_hash" {
  description = "Commit Hash (to use for identifying image)"
  default     = "latest"
}

variable "pdf_bucket" {
  description = "The name of the bucket to store the PDFs in"
  type        = string
}