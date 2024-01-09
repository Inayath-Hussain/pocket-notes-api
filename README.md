# Pocket Notes Server

RESTful API built using Express.js for **Pocket Notes**. Developed through the principles of Test-Driven Development. [Link for client side repo](https://github.com/Inayath-Hussain/pocket-notes)

## Routes
**/user/** - JWT based user authentication (login and signup). Used signed cookies for accessToken transmission between client and server.

**/notes** - to handle operations regarding user notes. Allowed methods are GET, POST and PATCH.