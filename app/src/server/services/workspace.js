const fetch = require("node-fetch");
const dotenv = require('dotenv').config();

const username = dotenv.parsed.GEO_SERVER_ADMIN;
const password = dotenv.parsed.GEO_SERVER_PASSWORD;
const baseUrl = dotenv.parsed.GEO_SERVER_URL;
const relativeUrl = '/rest/workspaces.json';
const url = `${baseUrl}${relativeUrl}`
const encodedCredentials = Buffer.from(`${username}:${password}`).toString(
  "base64"
);

module.exports = {
  getWorkspace: async (req, res) => {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Authorization": `Basic ${encodedCredentials}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Process the workspace data here
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
