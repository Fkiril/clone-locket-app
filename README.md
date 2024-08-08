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
        - userName
        - email
        - friends: a list to store frineds' id
        - friendRequests: a list to store friendId that send the request
        - picturesCanBeSeen: a list to store pictures' id which that user can see from that user and from that user's friends that prescribe permission for that user to see

    chat-manager: (only for user)
        - userId
        - conversationStates: object with key is conversationId and value is number of unread messages
        - friendConversations: object with key is friendId and value is conversationId with that friend

    conversation:
        - id
        - participants: list of userId
        - conversationImg: url (in firebase storage)
        - attachments
        - pictures
        - lastMessage: message (document of "messages" subcollection)
        # messages: subcollection

    message: (document of "messages" subcollection)
        - id
        - senderId
        - createdTime
        - text
        - attachment
        - isSeen

    picture:
        - id
        - ownerId
        - url (in firebase storage)
        - text
        - scope:
            + private
            + public
            + specifyate "willSee" list (a list of user's id that can see this picture, if scope is specify we will use specifyList), concurrently upload this picture to storage and add this picture's id to "picturesCanBeSeen" list of all user that appear in "willSee"
        - canSee: a list of user's id that can see this picture
        - reactions: a map with key is userId and value is type of reaction (like, love, haha, sad, angry)
