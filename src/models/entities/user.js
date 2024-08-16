export default class User {
    constructor(props) {
        this.id = props.id? props.id : "";
        this.userName = props.userName? props.userName : "";
        this.email = props.email? props.email : "";
        this.avatar = props.avatar? props.avatar : "";
        this.picturesCanSee = props.picturesCanSee? props.picturesCanSee : [];
        this.uploadedPictures = props.uploadedPictures? props.uploadedPictures : [];
        this.friends = props.friends? props.friends : [];
        this.friendRequests = props.friendRequests? props.friendRequests : [];
        this.blockeds = props.blockeds? props.blockeds : [];
        this.setting = props.setting? props.setting : {
            systemTheme: "light",
            language: "en",
            notificationSetting: "all"
        };
    };

    toJSON() {
        return {
            id: this.id,
            userName: this.userName,
            email: this.email,
            avatar: this.avatar,
            picturesCanSee: this.picturesCanSee.map(value => value),
            uploadedPictures: this.uploadedPictures.map(value => value),
            friends: this.friends.map(value => value),
            friendRequests: this.friendRequests.map(value => value),
            blockeds: this.blockeds.map(value => value),
            setting: {
                systemTheme: this.setting.systemTheme,
                language: this.setting.language,
                notificationSetting: this.setting.notificationSetting
            }
        };
    }
}