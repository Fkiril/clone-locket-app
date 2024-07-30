How to run:
-Open terminal at root file
-Run npm install 
-npm install react-icons --save
-Npm run start
A real-time chat and sharing pictures, base on Locket.

Using Electron, ReactJS and Firebase.

Base on MVC architecture:
    - "/views": store all view function-components and css files.
    - "/models":
        + "./entities": decribe data structure of all entities of the system.
        + "./services": store logic to connect with outside services
        + "./utils": store logic to work with outside services, call API, ...
    - "/controllers": store logic to interact with view and tranfer data to view.
    - "/containers": store main componets to link to other view.components.
    - "/hooks": store custome ReactJS hook.


    user:
        - id
        - some infors
        - setting options
        - a list to store frineds' id
        - a list to store blocked's id
        - picturesCanBeSeen: a list to store pictures' id which that user can see (from that user and from that user's friends that prescribe permission for that user to see)

    picture:
        - id
        - userId
        - some infors
        - url (in firebase storage)
        - text
        - scope:
            + private
            + public
            + specify
        - specifyList

    So when a user post a picture, controller detects which scope does that picture in:
        - private: just that user can see
        - public: all of that user's friend can see
        - specify: just some specify friends of that user can see
    then, create "willSee" list (a list of user's id that can see this picture, if scope is specify we will use specifyList), concurrently upload this picture to storage and add this picture's id to "picturesCanBeSeen" list of all user that appear in "willSee"
