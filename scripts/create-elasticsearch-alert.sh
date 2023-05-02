#!/bin/bash

set -e
# Variables
KIBANA_URL=${KIBANA_URL:="http://localhost:5601"}
KIBANA_USERNAME=${KIBANA_USERNAME:="elastic"}
KIBANA_PASSWORD=${KIBANA_PASSWORD}
EMAIL_RECIPIENTS=${EMAIL_RECIPIENTS}
DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}
THRESHOLD=10

EMAIL_CONNECTOR_NAME=${EMAIL_CONNECTOR_NAME:="Elastic-Cloud-SMTP"}
WEBHOOK_CONNECTOR_NAME=${WEBHOOK_CONNECTOR_NAME:="Discord-Webhook"}
ALERT_RULE_NAME=${ALERT_RULE_NAME:="YT-Sync-Service-Alert"}

does_connector_exist() {
  connector_name="$1"
  connectors=$(curl -X GET -H "Content-Type: application/json" -H "kbn-xsrf: true" -u "$KIBANA_USERNAME:$KIBANA_PASSWORD" "$KIBANA_URL/api/actions/connectors")
  echo $connectors | jq -r --arg name "$connector_name" '.[] | select(.name == $name) | .id'
}

does_alert_exist() {
  alert_name="$1"
  encoded_alert_name=$(jq -rn --arg v "$alert_name" '$v|@uri')
  alerts=$(curl -X GET -H "Content-Type: application/json" -H "kbn-xsrf: true" -u "$KIBANA_USERNAME:$KIBANA_PASSWORD" "$KIBANA_URL/api/alerting/rules/_find?search_fields=name&search=$encoded_alert_name")
  echo $alerts | jq -r --arg name "$alert_name" '.data[] | select(.name == $name) | .id'
}

ES_QUERY=$(echo '{
  "fields": [
    {
      "field": "@timestamp",
      "format": "date_time"
    }
  ],
  "stored_fields": ["*"],
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "format": "strict_date_optional_time",
              "gte": "now-15m/m",
              "lte": "now/m"
            }
          }
        },
        {
          "match_phrase": {
            "severity.keyword": "error"
          }
        }
      ]
    }
  }
}' | jq -c '. | tostring')

EMAIL_CONNECTOR_ID=$(does_connector_exist $EMAIL_CONNECTOR_NAME)

echo "Email connector ID: $EMAIL_CONNECTOR_ID"

WEBHOOK_CONNECTOR_ID=$(does_connector_exist $WEBHOOK_CONNECTOR_NAME)

if [[ -z "$WEBHOOK_CONNECTOR_ID" ]]; then
  WEBHOOK_CONNECTOR_ID=$(curl -X POST -H "Content-Type: application/json" -H "kbn-xsrf: true" -u "$KIBANA_USERNAME:$KIBANA_PASSWORD" "$KIBANA_URL/api/actions/connector" -d '{
  "name": "'"$WEBHOOK_CONNECTOR_NAME"'",
  "connector_type_id": ".webhook",
  "config": {
    "url": "'"$DISCORD_WEBHOOK_URL"'",
    "hasAuth": false,
    "headers": {
      "Content-Type": "application/json"
    }
  }
}' | jq -r '.id')

  echo "Created Discord webhook connector with ID: $WEBHOOK_CONNECTOR_ID"
else
  echo "Discord webhook connector with name '$WEBHOOK_CONNECTOR_NAME' already exists, skipping creation."
fi

RULE_ID=$(does_alert_exist $ALERT_RULE_NAME)

if [[ -z "$RULE_ID" ]]; then
  RULE_ID=$(curl -X POST -u $KIBANA_USERNAME:$KIBANA_PASSWORD "$KIBANA_URL/api/alerting/rule" -H 'kbn-xsrf: true' -H 'Content-Type: application/json' -d '{
  "params":{
      "aggType":"count",
      "termSize":6,
      "thresholdComparator":">",
      "timeWindowSize":5,
      "timeWindowUnit":"m",
      "groupBy":"all",
      "threshold":[ 1 ],
      "index":[
         "youtube-synch"
      ],
      "size": 5,
      "esQuery": '"$ES_QUERY"',
      "timeField":"@timestamp"
   },
   "consumer":"alerts",
   "rule_type_id":".es-query",
   "schedule":{
      "interval":"5m"
   },
   "actions":[
      {
         "id": "'"$EMAIL_CONNECTOR_ID"'",
         "group": "query matched",
         "params":{
            "to": '"$EMAIL_RECIPIENTS"',
            "subject": "Youtube-Synch Service encountered error/s",
            "message": "Elasticsearch query alert \"{{alertName}}\" is active & following errors triggered the alert: \n\n {{#context.hits}} \n timestamp: \"{{_source.@timestamp}}\", \n message: \"{{_source.message}}\", \n videoId: \"{{_source.fields.videoId}}\", \n channelId: \"{{_source.fields.channelId}}\" \n\n {{/context.hits}} \n\n - Value: {{context.value}} \n - Conditions Met: {{context.conditions}} over {{params.timeWindowSize}}{{params.timeWindowUnit}} \n - Timestamp: {{context.date}}"
         }
      },
      {
         "id": "'"$WEBHOOK_CONNECTOR_ID"'",
         "group": "query matched",
         "params":{
            "body": "{\"embeds\":[{\"title\":\"Elasticsearch query alert \\\"{{alertName}}\\\" is active & following errors triggered the alert: \", \"fields\": [{ \"name\": \"\", \"value\": \"{{#context.hits}} \\n timestamp: \\\"{{_source.@timestamp}}\\\", \\n message: \\\"{{_source.message}}\\\", \\n videoId: \\\"{{_source.fields.videoId}}\\\", \\n channelId: \\\"{{_source.fields.channelId}}\\\" \\n {{/context.hits}} \\n\\n - Value: {{context.value}} \\n - Conditions Met: {{context.conditions}} over {{params.timeWindowSize}}{{params.timeWindowUnit}} \\n - Timestamp: {{context.date}}\" }] ,\"timestamp\":\"{{context.date}}\"}]}"
         }
      },
      {
         "id": "'"$WEBHOOK_CONNECTOR_ID"'",
         "group": "recovered",
         "params":{
            "body": "{\"embeds\":[{\"title\":\"Youtube-Synch Service Recovered\",\"timestamp\":\"{{context.date}}\"}]}"
         }
      },
      {
         "id": "'"$EMAIL_CONNECTOR_ID"'",
         "group": "recovered",
         "params":{
            "to": '"$EMAIL_RECIPIENTS"',
            "subject": "Youtube-Synch Service Recovered",
            "message": "Recovered"
         }
      }
   ],
   "notify_when":"onActionGroupChange",
   "name": "'"$ALERT_RULE_NAME"'"
}')

  echo "Created rule with ID: $RULE_ID"
else
  echo "Kibana Alert Rule with name '$ALERT_RULE_NAME' already exists, skipping creation."
fi
