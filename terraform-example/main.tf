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

// Create a service account and key for the stack
resource "grafana_cloud_stack_service_account" "cloud_sa" {
  provider   = grafana.cloud
  stack_slug = data.grafana_cloud_stack.stack.slug

  name        = "demo service account"
  role        = "Admin"
  is_disabled = false
}

resource "grafana_cloud_stack_service_account_token" "cloud_sa" {
  provider   = grafana.cloud
  stack_slug = data.grafana_cloud_stack.stack.slug

  name               = "terraform serviceaccount key"
  service_account_id = grafana_cloud_stack_service_account.cloud_sa.id
}

provider "grafana" {
  alias = "stack"

  url  = data.grafana_cloud_stack.stack.url
  auth = grafana_cloud_stack_service_account_token.cloud_sa.key
}