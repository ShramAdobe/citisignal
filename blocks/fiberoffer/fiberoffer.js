export default function decorate(block) {
    const offerText = block.children[0];
    const offerCTA = block.children[1];
    const offerImage = block.children[2];
  
    offerText.id = 'offerText';
    offerText.className = 'offerText';
    offerCTA.id = 'offerCTA';
    offerCTA.className = 'offerCTA';
    offerImage.id = 'offerImage';
    offerImage.className = 'offerImage';

    var script1 = document.createElement('script');
  script1.text = "!function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||[]).push(o),n[o]=function(){var u=arguments;return new Promise(function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}(window,['alloy']);"
  document.head.appendChild(script1);

  var script2 = document.createElement('script');
  script2.async = true;
  script2.src = "https://cdn1.adoberesources.net/alloy/2.14.0/alloy.min.js";
  document.head.appendChild(script2);

  alloy("configure", {
    "edgeConfigId": "045c5ee9-468f-47d5-ae9b-a29788f5948f",
    "orgId": "907075E95BF479EC0A495C73@AdobeOrg",
    "defaultConsent": "in"
  });
  var ECID = "";

  alloy("getIdentity")
    .then(function (result) {
      // The command succeeded.
      console.log("ECID:", result.identity.ECID);
      ECID = result.identity.ECID;
      getOffer(ECID);

    })
    .catch(function (error) {
      // The command failed.
      // "error" will be an error object with additional information.
    });

  }
  async function getOffer(ECID) {
    var url = "https://edge.adobedc.net/ee/irl1/v1/interact?configId=045c5ee9-468f-47d5-ae9b-a29788f5948f";
  
    var timestamp = new Date().toISOString();
  
    var offerRequest = {
      "events": [
        {
          "xdm": {
            "eventType": "decisioning.propositionDisplay",
            "timestamp": timestamp,
            "_experienceplatform": {
              "identification": {
                "core": {
                  "ecid": ECID
                }
              }
            },
            "identityMap": {
              "ECID": [
                {
                  "id": ECID
                }
              ]
            }
          },
          "query": {
            "personalization": {
              "schemas": [
                "https://ns.adobe.com/personalization/default-content-item",
                "https://ns.adobe.com/personalization/html-content-item",
                "https://ns.adobe.com/personalization/json-content-item",
                "https://ns.adobe.com/personalization/redirect-item",
                "https://ns.adobe.com/personalization/ruleset-item",
                "https://ns.adobe.com/personalization/message/in-app",
                "https://ns.adobe.com/personalization/message/content-card",
                "https://ns.adobe.com/personalization/dom-action"
              ],
              "decisionScopes": [
                "eyJ4ZG06YWN0aXZpdHlJZCI6ImRwczpvZmZlci1hY3Rpdml0eToxYTI3ODk3NzAzYTY5NWZmIiwieGRtOnBsYWNlbWVudElkIjoiZHBzOm9mZmVyLXBsYWNlbWVudDoxYTI0ZGM2MWJmYjJlMjIwIn0=",
                "eyJ4ZG06YWN0aXZpdHlJZCI6ImRwczpvZmZlci1hY3Rpdml0eToxYTI3ODk3NzAzYTY5NWZmIiwieGRtOnBsYWNlbWVudElkIjoiZHBzOm9mZmVyLXBsYWNlbWVudDoxYTI0ZGM0MzQyZjJlMjFlIn0="
              ]
            }
          }
        }
      ]
    }
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(offerRequest),
      });
  
      if (response.status === 200) {
        var body = await response.json();
        console.log("Offer Decisioning Response: ", body);
  
        const decisions = body["handle"];
  
        decisions.forEach(decision => {
          if (decision["type"] == "personalization:decisions") {
            console.log("Offer Decisioning decision detail: ", decision);
            const payloads = decision["payload"];
  
            if (payloads === undefined || payloads.length == 0) {
              //do nothing
            } else {
              payloads.forEach(payload => {
                if (payload["placement"]["name"] == "Web - Image") {
                  console.log("Web-Image payload");
                  const items = payload["items"];
                  items.forEach(item => {
                    if (item["id"].includes("dps:fallback-offer")) {
                      console.log("Item details: ", item);
                      const deliveryURL = item["data"]["deliveryURL"];
  
                      document.querySelector("#offerImage").innerHTML = "<img style='max-width:100%;' src='" + item["data"]["deliveryURL"] + "'/>";
                    } else if (item["id"].includes("dps:personalized-offer")) {
                      console.log("Item details: ", item);
                      const deliveryURL = item["data"]["deliveryURL"];
                      console.log("Web-Image Personalized Offer Content: ", deliveryURL)
  
                      document.querySelector("#offerImage").innerHTML = "<img style='max-width:100%;' src='" + item["data"]["deliveryURL"] + "'/>";
                    }
                  });
                } else if (payload["placement"]["name"] == "Web - JSON") {
                  console.log("Web-JSON payload");
                  const items = payload["items"];
                  items.forEach(item => {
                    if (item["id"].includes("dps:fallback-offer")) {
                      const content = JSON.parse(item["data"]["content"]);
  
                      console.log("Web-JSON Fallback Content: ", content)
  
                      document.querySelector("#offerText").innerHTML = content.text;
                      document.querySelector("#offerCTA").innerHTML = content.cta;
                    } else if (item["id"].includes("dps:personalized-offer")) {
                      const content = JSON.parse(item["data"]["content"]);
  
                      console.log("Web-JSON Personalized Offer Content: " + content);
  
                      document.querySelector("#offerText").innerHTML = content.text;
                      document.querySelector("#offerCTA").innerHTML = content.cta;
                    }
                  });
                }
              });
            }
            document.querySelector("#offerImage").style.display = "block";
            document.querySelector("#offerText").style.display = "block";
            document.querySelector("#offerCTA").style.display = "block";
          }
        });
      } else {
        console.warn("Offer Decisioning Response unsuccessful:", response.body);
      }
    } catch (error) {
      console.error("Error when getting Offer Decisioning Response:", error);
    }
  }
  
  