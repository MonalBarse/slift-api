# Slift API

## Overview

Slift API offers a powerful text analysis service that swiftly identifies inappropriate language in textual messages.
It provides a quick and efficient way to flag messages that may contain inappropriate content.
It is designed to be easily integrated into any application, allowing developers to quickly and effectively moderate user-generated content.

## Features

- **Content Analysis**: Detects and flags potentially inappropriate language. And identifies specific words or phrases that triggered the detection.
- **Scoring System**: Provides a confidence score indicating the likelihood of sensitive content.

## Usage

To utilize the Slift API, send a POST request to the hosted endpoint.

### Endpoint

```http
    https://api.slift.io/v1/analyze
```

### Request payload

```json
{
  "message": "What da ****"
}
```

- The response will be in the following format

```json
{
    "isProfane": true | false,  // true if the message contains a profane word
    "score": (between 0 and 1), // 1 meaning that message had a profane word
    "flaggedFor": "****"        // The word that triggered the detection
}

```

