project_name: "tldd"

application: tldd {
  label: "tldd"
  # url: "https://storage.googleapis.com/tldd-frontend/bundle.js"
  url: "https://localhost:8080/bundle.js"
  entitlements: {
    external_api_urls: ["https://vertex-dashboards-2w54ohrt4q-uc.a.run.app", "https://localhost:8080"]
    global_user_attributes: ["looker_hackathon_vertexai_tldd_api"]
  }
}
