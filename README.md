# The Eventual PlayFramework-AngularJS-Bootstrap-MongoDB Seed Project

## Introduction

The Eventual PlayFramework-AngularJS-Bootstrap-MongoDB Seed Project is a seed project that provides a [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) implementation. It uses the [Play Framework](http://www.playframework.com/) and [MongoDB](http://www.mongodb.org/) on the back-end, and [AngularJS](http://angularjs.org/) and [Bootstrap](http://getbootstrap.com/) on the front-end. It is designed to underpin the development of future applications that adopt the same combination of technologies.

## Features
The seed has the following features (to recall a few):

1. It offers a complete [single-page application](http://en.wikipedia.org/wiki/Single-page_application) experience.

2. It uses the asynchronous and non-blocking [ReactiveMongo driver](http://reactivemongo.org/).

3. It supports the new HTML5 routing and histoty API (i.e., no hashbangs, no bullshit).

4. It packs JavaScript libraries inside the solution (i.e., no WebJars, no download time, and again no bullshit).

5. It makes minimal usage of [Play Scala templates](http://www.playframework.com/documentation/2.1.5/ScalaTemplates), thereby clearing the space for AngularJS directives in your HTML.

6. It cleanly separates between Play routes that serve HTML and those that serve JSON.

7. It cleanly separates and optimally maps AngularJS routes to Play routes.

8. It conceals Play routes from end-users, thereby ensuring that all pages are properly styled before they are presented.

## Ingredients
The seed uses the following software components:

1. Play Framework 2.1.5

2. MongoDB 2.4.8

3. AngularJS 1.1.5

4. Bootstrap 3.0.2

5. jQuery 1.10.2 (used by 4)

## Deployment
Follow these steps in order to deploy the seed on your machine:

1. Download and extract Play Framework 2.1.5.

2. Download and extract MongoDB 2.4.8.

3. Clone the project: <code>git clone https://github.com/angyjoe/eventual.git</code>.

4. Start <code>mongod</code> (the daemon process for the MongoDB system).

5. Create and populate the celebrities’ database using the script <code>/eventual/db/script.js</code>.

6. Go to the root of the project: <code>cd eventual</code>.

7. Launch Play at the default 9000 port: <code>/PATH-TO-PLAY/play run</code>.

8. Enjoy the seed: [http://localhost:9000](http://localhost:9000) or the following screenshots!

## Screenshots

### Celebrities List
![Celebrities List](./screenshots/Celebrities%20List.png)

### Adding a Celebrity
![Adding a Celebrity](./screenshots/Adding%20a%20Celebrity.png)

### Editing/Deleting a Celebrity
![Editing a Celebrity](./screenshots/Editing-Deleting%20a%20Celebrity.png)

## Licence

This software is licensed under the **[GNU General Public License Version 3](./LICENSE)**.

Copyright &copy; 2013 **[Sari Haj Hussein](http://sarihh.info)**.

## Code Disclaimer

The author of this software code has used his best efforts in preparing the code. These efforts include the development, research, testing, and optimization of the theories and programs to determine their effectiveness. This software code is not designed or intended for use in the design, construction, operation or maintenance of any nuclear facility. Author disclaims any express or implied warranty of fitness for such uses. The author makes no warranty of any kind, expressed or implied, with regard to this software code or to the documentation accompanying it. In no event shall the author be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption whatsoever) arising out of, the furnishing, performance, or use of this software code, even if advised of the possibilities of such damages.