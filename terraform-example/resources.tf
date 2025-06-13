resource "grafana_data_source" "prometheus-new" {
  provider   = grafana.stack
  name       = "GrafanaCloudPrometheus"
  type       = "prometheus"
  url        = data.grafana_cloud_stack.stack.prometheus_url
  is_default = true
}

resource "grafana_dashboard" "microservices" {
  provider    = grafana.stack
  config_json = file("${path.module}/dashboards/microservices-dashboard.json")
  overwrite   = true
}

resource "grafana_dashboard" "microservices-local" {
  provider    = grafana.local
  config_json = file("${path.module}/dashboards/microservices-dashboard.json")
  overwrite   = true
}