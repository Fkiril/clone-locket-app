const avatarSettingPortal = () => {
        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".body img") || clickElement.closest(".body .setting-button"))) {
                setAvatarSetting(false);
            }
        }

        return createPortal((
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <img src={optionAvatarUrl || avatarUrl || "./default_avatar.jpg"} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
                    <div className="flex flex-col items-center space-y-2">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" type="button" onClick={() => document.getElementById("file").click()}>
                            Change Avatar
                            <input
                                type="file"
                                id="file"
                                style={{ display: "none" }}
                                onChange={handleAvatar}
                            />
                        </button>
                        {optionAvatarUrl && (
                            <div className="flex space-x-2">
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg" type="button" onClick={submitOption}>
                                    Save Change
                                </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg" type="button" onClick={cancelOption}>
                                    Cancel
                                </button>
                            </div>
                        )}
                        {avatarUrl && !optionAvatarUrl && (
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg" type="button" onClick={() => userController.deleteAvatar()}>
                                Delete Avatar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ), document.body);
    }