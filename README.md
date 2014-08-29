# TODO

- vérifier la taille des images
- croper et redimentionner les images
- isActive sur le menu (à gauche)
- directive alert
- système de messages (toast)

# Deploying to firebase

- run `grunt build`
- copy dist/styles/main.css in app/styles/ folder
- run `firebase deploy`

Explanation :
I had some troubles with the grunt build so I do not deploy dist/folder to firebase :(
So, I uglily deploy the app/ folder but the generated stylesheet is missing...
