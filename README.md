# Admin app for Cookers

See app in production: https://crackling-fire-7710.firebaseapp.com/

## TODO

- vérifier la taille des images
- croper et redimentionner les images
- isActive sur le menu (à gauche)
- directive alert
- système de messages (toast)

## Getting started

- run `npm install`
- run `bower install`
- run `grunt serve` and you're done !!!

To get phone preview, you have to put the ionic app in folder `app/ionicApp/`

## Deploying to firebase

- run `grunt build`
- copy `dist/styles/main.css` in `app/styles/` folder
- run `firebase deploy`

To install firebase CLI : https://www.firebase.com/docs/hosting.html

**Explanation :**  
I had some troubles with the grunt build so I do not deploy `dist/` folder to firebase :(  
I uglily deploy the `app/` folder but the generated stylesheet needs to be added manually...

## Notes

- For charts, use : highcharts
- Export data from mixpanel : https://github.com/michaelcarter/mixpanel-data-export-js
- Mixpanel api docs : https://mixpanel.com/docs/api-documentation/data-export-api
