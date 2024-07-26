export default class User {
    constructor(id, userName, email, avatar, picturesCanSee, friends, blocked, friendRequests, setting) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.avatar = avatar;
        this.picturesCanSee = picturesCanSee;
        this.friends = friends;
        this.blocked = blocked;
        this.friendRequests = friendRequests;
        this.setting = setting;
    };

    toJSON() {
        return {
            id: this.id,
            userName: this.userName,
            email: this.email,
            avatar: this.avatar,
            picturesCanSee: this.picturesCanSee.map(value => value),
            friends: this.friends.map(value => value),
            blockeds: this.blocked.map(value => value),
            friendRequests: this.friendRequests.map(value => value),
            setting: {
                systemTheme: this.setting.systemTheme,
                language: this.setting.language,
                notificationSetting: this.setting.notificationSetting
            }
        };
    }
}