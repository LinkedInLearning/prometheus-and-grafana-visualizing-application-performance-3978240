variable "grafana_cloud_url" {
  description = "The URL of your Grafana Cloud instance"
  type        = string
}

variable "grafana_cloud_token" {
  description = "Access Policy token for Grafana Cloud"
  type        = string
  default     = ""
  sensitive   = true
}

variable "grafana_cloud_slug" {
  description = "Slug for Grafana Cloud"
  type        = string
}