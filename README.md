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