terraform {
  required_providers {
    grafana = {
      source  = "grafana/grafana"
      version = ">= 3.19.0"
    }
  }
}

provider "grafana" {
  alias                     = "cloud"
  url                       = var.grafana_cloud_url
  cloud_access_policy_token = var.grafana_cloud_token
}

data "grafana_cloud_stack" "stack" {
  provider = grafana.cloud
  slug     = var.grafana_cloud_slug
}

provider "grafana" {
  alias = "local"
  url   = "http://localhost:3500"
  auth = "admin:admin"
}
