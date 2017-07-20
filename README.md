# Art API

## Getting Started

### Clone the repository

 Using your preferred command line application run the commands below in order to clone the project from github

 `git clone https://github.com/bcg5039/art-api-exam.git <your project folder name goes here>`

 Now navigate to the freshly cloned repo within your local file system so you can download the project dependencies.

 `cd <your project folder name>`

### Download project dependencies

 You will want to download all the dependencies for this project using the following command

 `npm install`

### Setting up **.env** file

 Next you will want to set up your .env file holding the data to reach your database and which port you want to run the API from.  

 - Create a new file named **.env** this will hold your database's key and password value and keep it secret so nobody can abuse your database without your given consent.
 - To make life easier copy and paste the variable names from the **.env-sample** file already in the project into your newly created **.env** file.
 - The format for the `COUCHDB_URL` is `https://<yourDbKey>:<yourDbPassword>@<baseDbUrl>`
 - The baseDbUrl should look something like `random-letters-and-numbers-bluemix.cloudant.com/` make sure you do not include `https://` or anything past `.com/` in the baseDbUrl!
 - For the port value within **.env** pick a port your machine is not using. A port value of 5000 is defaulted if you do not set this value.
 - Set the `COUCHDB_NAME=` to the name of your database on cloudant and congratulations your **.env** file is ready to go!

### Load the art data and indexes!

 Scripts have been put in place to make this easier for you.  

 Within your command line application navigate to the project folder and type `npm run load` this will populate your database on cloudant.

 Next load your indexes by typing `npm run loadIndex`

### Did I do this all right? (launch the API)

 Time for the moment of truth in your command line type `npm start` to launch your API on whichever port you provided within the **.env** file if successful your command line will give you the following feedback `API UP ON port: <yourport>`

### Almost there! Lets make sure you can talk to the API.

 Open your preferred browser and in the address bar type `localhost:<yourport>/` Your browser should say *Welcome to the Art API. Manage all the paintings.*

 If you come across any problems up to this point carefully review each step for those who were successful check below to see everything this API can do.

# Art Environment Variables

**IMPORTANT** The following examples will use port 4000 replace this with your chosen port from your **.env** file

## **GET** localhost:4000/art/paintings

This will return the list of paintings.

**Request URL**

`localhost:4000/art/paintings`

Your response should be an array of paintings that looks something like this
#### Response 200
```
{
  "_id": "painting_bal_du_moulin_de_la_galette",
  "_rev": "4-f9e65be1da3829cc8ae066bad3751d90",
  "name": "Bal du moulin de la Galette",
  "type": "painting",
  "movement": "impressionism",
  "artist": "Pierre-Auguste Renoires",
  "yearCreated": 1876,
  "museum": {
    "name": "Musée d’Orsay",
    "location": "Paris"
  }
}
```

This API currently supports filtering on the movement property more filtering will be added in future.

To try out filtering try this **GET** `/localhost:4000/art/paintings?filter=movement:impressionism`

If thats too many results add a limit to the search parameters.

**GET** `localhost:4000/art/paintings?filter=movement:impressionism&limit=2`

#### Response 404

This error code is sent if it cannot find the target in the url check your url to make sure there are no typos and make sure your API is up and running.

## **GET** localhost:4000/art/paintings/:id
This will get a painting based off the provided ID value.

**Request URL**

`localhost:4000/art/paintings/painting_bal_du_moulin_de_la_galette`

#### Response 200

```
{
    "_id": "painting_bal_du_moulin_de_la_galette",
    "_rev": "4-f9e65be1da3829cc8ae066bad3751d90",
    "name": "Bal du moulin de la Galette",
    "type": "painting",
    "movement": "impressionism",
    "artist": "Pierre-Auguste Renoires",
    "yearCreated": 1876,
    "museum": {
        "name": "Musée d’Orsay",
        "location": "Paris"
    }
}
```

#### Response 404

This error code is sent if it cannot find the target in the url check your url to make sure there are no typos and make sure your API is up and running Also make sure the target id value you are trying to find exists.

## **POST** localhost:4000/art/paintings/

Use this to add a painting to the array of paintings

**Sample Request**

**POST** `localhost:4000/art/paintings/`

**Sample Body JSON Data**
```
{
    "name": "The Persistence of Memory",
    "movement": "surrealism",
    "artist": "Salvador Dali",
    "yearCreated": 1931,
    "museum": {"name": "Musuem of Modern Art", "location": "New York"}
}
```

#### Response 201

Successfully created a new painting.  The response should look like this
```
{
    "ok": true,
    "id": "painting_persistence_of_memory",
    "rev": "1-c617189487fbe325d01cb7fc74acf45b"
}
```

#### Response 409

Oops this is the error message received if the painting you are trying to create already exists check your database and make sure the id value is not taken by another painting if your sure its a new painting. The response error will look like this.
```
{
  "name": "conflict",
  "status": 409,
  "message": "Document update conflict.",
  "reason": "Document update conflict.",
  "error": "conflict"
}
```

## **PUT** localhost:4000/art/paintings/:id

Update a painting specified by the given id.

**Sample Request**

```
PUT localhost:4000/art/paintings/painting_bal_du_moulin_de_la_galette
```

**Sample Body JSON Data**

```
{
  "_id": "painting_bal_du_moulin_de_la_galette",
  "_rev": "1-c617189487fbe325d01cb7fc74acf45b",
  "name": "Bal du moulin de la Galette",
  "type": "painting",
  "movement": "impressionism",
  "artist": "Pierre-Auguste Renoires",
  "yearCreated": 1877,
  "museum": {name: "Musée d’Orsay", location: "Paris"}
}
```

#### Response 200

Successful response should look like this.

```
{
  "ok": true,
  "id": "painting_bal_du_moulin_de_la_galette",
  "rev": "2-7e9b8cac710e70bfe0bef2de7bb3cfdb"
}
```

#### Response 409

This error code is sent if your rev number does not match the current rev in database double check and make sure they match before sending request again.
Here is an example of the error

```
{
  "name": "conflict",
  "status": 409,
  "message": "Document update conflict.",
  "reason": "Document update conflict.",
  "error": "conflict"
}
```

## **DELETE** localhost:4000/art/paintings/:id

Deleted a painting selected by the id value.

**Sample Request**

**DELETE** `localhost:4000/art/paintings/painting_bal_du_moulin_de_la_galette`

#### Response 200

Successfully deleted the painting.

```
{
      "ok": true,
      "id": "painting_bal_du_moulin_de_la_galette",
      "rev": "3-fdd7fcbc62477372240862772d91c88f"
}
```

#### Response 404

This error message means the painting cannot be found check your id value for typos or make sure the painting you want to delete exists.

```
{
  "name": "not_found",
  "status": 404,
  "message": "deleted",
  "reason": "deleted",
  "error": "not_found"
}
```

## Pagination

## GET localhost:4000/art/paintings

Using pagination you can search paintings with a limit and start from a specified lastItem.

**GET** `localhost:4000/art/paintings?limit=2&lastItem=painting_guernica`

This will grab the items after painting the with id painting_guernica and due to limit parameter it will only display 2.

**Sample Response**

    ```
    [
      {
        "_id": "painting_last_supper",
        "_rev": "3-418af3c02f63725a2bd7941afe0cc3c6",
        "name": "The Last Supper",
        "type": "painting",
        "movement": "Renaissance",
        "artist": "Leonardo da Vinci",
        "yearCreated": 1495,
        "museum": {
            "name": "Santa Maria delle Grazie",
            "location": "Milan"
          }
      },
      {
        "_id": "painting_starry_night",
        "_rev": "3-5e8b713e1644779ebbb29c539166bd81",
        "name": "The Starry Night",
        "type": "painting",
        "movement": "post-impressionism",
        "artist": "Vincent van Gogh",
        "yearCreated": 1889,
        "museum": {
            "name": "Museum of Modern Art",
            "location": "New York"
        }
      }
    ]
