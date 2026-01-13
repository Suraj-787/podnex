import { ProfileForm } from "@/components/settings/ProfileForm";

// This would normally fetch from API
// For now, using mock data - will be replaced with actual API call
const getUserProfile = async () => {
    // TODO: Replace with actual API call
    return {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        image: null,
    };
};

export default async function ProfilePage() {
    const user = await getUserProfile();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
