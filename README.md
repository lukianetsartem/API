# Store REST API

Developed by lukianetsartem

## Routes

Base URL: http://localhost:4000

### /shop

GET /products

Response example: {
  "count": number,
  "products": [
    {
      "productParams": {
        "height": number,
        "width": number,
        "depth": number,
        "weight": number,
        "size": number
      },
      "details": {
        "assembly": string,
        "fabricComposition": string,
        "foamType": string,
        "care": string
      },
      "productPhotos": {
        "additionalPhotos": [],
        "houseProudPhotos": [],
        "modelPhoto": string,        
        "interiorPhoto": string,
        "sizePhoto": string
      },
      "productStory": {
        "storyHeader": string,
        "storyText": string
      },
      "_id": "5ee75660ddddd617b4966d6c",
      "productType": string,
      "name": string,
      "price": number,
      "oldPrice": number,
      "description": string,
      "inStock": number,
      "color": string,
      "productLink": string
    }
  ]
}