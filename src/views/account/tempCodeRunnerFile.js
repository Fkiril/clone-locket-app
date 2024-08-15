const submitOption = async () => {
            try {
                if (editorRef.current) {
                    const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
                    const blob = await fetch(canvas).then(res => res.blob());
                    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
                    await userController.changeAvatar(file).then((avatarUrl) => {
                        toast.success("Change avatar successfull!");
                        currentUser.avatar = avatarUrl;
                        currentUser.avatarFile = file;
                        currentUser.avatarFileUrl = URL.createObjectURL(file);
                        setSelectedAvatar({ file: null, url: "" });
                        setIsSettingAvatar(false);
                    }).catch((error) => {
                        console.error("Failed to change avatar:", error);
                        toast.error("Failed to change avatar. Please try again.");
                    });
                } else {
                    console.error("Editor reference is null");
                }
            } catch (error) {
                console.error("Error during submitOption:", error);
            }
        };