"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { useProfile, useUpdateProfile, useDeleteAccount } from "@/lib/hooks";
import { ArrowLeft, User, Mail, Trash2, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: profile, isLoading } = useProfile();
    const updateMutation = useUpdateProfile();
    const deleteMutation = useDeleteAccount();

    const [name, setName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Initialize name when profile loads
    useState(() => {
        if (profile?.name) {
            setName(profile.name);
        }
    });

    const handleUpdateProfile = () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        updateMutation.mutate(
            { name: name.trim() },
            {
                onSuccess: () => {
                    setIsEditing(false);
                },
            }
        );
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            "Are you sure you want to delete your account? This action cannot be undone and all your podcasts will be permanently deleted."
        );

        if (!confirmed) return;

        const doubleConfirm = prompt(
            'Type "DELETE" to confirm account deletion:'
        );

        if (doubleConfirm !== "DELETE") {
            toast.error("Account deletion cancelled");
            return;
        }

        deleteMutation.mutate(undefined, {
            onSuccess: () => {
                // Redirect to home page after account deletion
                window.location.href = "/";
            },
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        );
    }

    const user = profile || session?.user;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/settings")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="font-serif text-3xl font-medium">Profile Settings</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your account information
                    </p>
                </div>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your personal details and profile picture
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                            <AvatarFallback className="text-lg">
                                {user?.name?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{user?.name || "User"}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleUpdateProfile}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setName(user?.name || "");
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    id="name"
                                    value={user?.name || ""}
                                    disabled
                                    className="flex-1"
                                />
                                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                            </div>
                        )}
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="flex-1"
                            />
                            <Button variant="outline" disabled>
                                Verified
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed. Contact support if you need to update it.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>
                        Manage your account settings and data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Account Status</p>
                                <p className="text-sm text-muted-foreground">
                                    Your account is active
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" disabled>
                            Active
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates about your podcasts
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" disabled>
                            Enabled
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/20">
                <CardHeader>
                    <CardTitle className="text-red-500">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions that affect your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-500">Delete Account</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Permanently delete your account and all associated data. This
                                    action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteMutation.isPending}
                            className="shrink-0"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
