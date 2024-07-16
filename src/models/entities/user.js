export default class User {
    constructor(id, userName, email, avatar, pictures, friends, blocked, setting) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.avatar = avatar;
        this.pictures = pictures;
        this.friends = friends;
        this.blocked = blocked;
        this.setting = setting;
    };

    toJSON() {
        return {
            id: this.id,
            userName: this.userName,
            email: this.email,
            avatar: this.avatar,
            pictures: this.pictures.map(value => value.toJSON()),
            friends: this.friends.map(value => value.toJSON()),
            blockeds: this.blocked.map(value => value.toJSON()),
            setting: {
                systemTheme: this.setting.systemTheme,
                language: this.setting.language,
                notificationSetting: this.setting.notificationSetting
            }
        };
    }
}