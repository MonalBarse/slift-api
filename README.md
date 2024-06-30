# Slift API

## Overview

Slift API offers a powerful text analysis service that swiftly identifies inappropriate language in textual messages. It provides a quick and efficient way to flag messages that may contain inappropriate content. Designed for easy integration, this API allows developers to quickly and effectively moderate user-generated content.

## Features

- **Content Analysis:** Detects and flags potentially inappropriate language, identifying specific words or phrases that triggered the detection.
- **Scoring System:** Provides a confidence score indicating the likelihood of sensitive content.

## Tech Stack

- **Backend:** HonoJs for advanced text analysis capabilities
- **Database:** Upstash-Vector (Vector Database) for efficient data storage and retrieval
- **Deployment:** Cloudflare for scalable and efficient API hosting


## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/MonalBarse/slift-api
   ```

2. **Install Dependencies:**

   ```bash
   cd slift-api
   npm install
   ```

3. **Run the Application:**

   ```bash
   npm start
   ```

   Ensure you have a `.env` file in the root directory with the following configuration:

   ```bash
   PORT=3000
   API_KEY=your_api_key
   NODE_ENV=production
   ```

## Usage

To utilize the Slift API, send a POST request to the hosted endpoint.

### Endpoint

```
https://slift-api.monalbarse.workers.dev/
```

### Request Payload

```json
{
  "message": "What da ****"
}
```

### Response Format

```json
{
  "isProfane": true,
  "score": 0.9,
  "flaggedFor": "****"
}
```

### Example Request

```bash
curl -X POST https://slift-api.monalbarse.workers.dev/ -H "Content-Type: application/json" -d '{"message": "What da ****"}'
```

### Note:

- The `isProfane` field indicates whether the message contains inappropriate language.
- The `score` field provides a confidence level of the inappropriate content, ranging from 0 to 1.
- The `flaggedFor` field shows the specific word or phrase that triggered the detection.

## Contributing

Feel free to contribute by:

- Reporting issues
- Adding new features
- Improving existing code

To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am "build:"`). Follow [these](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum) guidelines for any commit messages.
4. Push to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.
