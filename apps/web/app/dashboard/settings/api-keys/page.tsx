"use client";

import { useState } from "react";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/hooks";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Key, Copy, Trash2, Plus, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function ApiKeysPage() {
    const { data: apiKeys, isLoading } = useApiKeys();
    const createMutation = useCreateApiKey();
    const revokeMutation = useRevokeApiKey();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newKeyName.trim()) {
            toast.error("Please enter a name for the API key");
            return;
        }

        const result = await createMutation.mutateAsync({
            name: newKeyName,
            scopes: ["podcasts:read", "podcasts:write"],
        });

        setCreatedKey(result.key);
        setNewKeyName("");
        setShowCreateForm(false);
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success("API key copied to clipboard");
    };

    const handleRevoke = async () => {
        if (!keyToRevoke) return;
        await revokeMutation.mutateAsync(keyToRevoke);
        setKeyToRevoke(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-semibold">API Keys</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your API keys for programmatic access to PodNex
                    </p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Production Server"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Created Key Alert */}
            {createdKey && (
                <Card className="p-6 border-green-500/50 bg-green-500/5">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1 space-y-3">
                            <div>
                                <h3 className="font-semibold">API Key Created Successfully</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Make sure to copy your API key now. You won't be able to see it again!
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono break-all">
                                    {createdKey}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyKey(createdKey)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button size="sm" onClick={() => setCreatedKey(null)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* API Keys List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : apiKeys && apiKeys.length > 0 ? (
                <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                        <Card key={apiKey.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Key className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono">
                                                {apiKey.prefix}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyKey(apiKey.prefix)}
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            <span>
                                                Created {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                                            </span>
                                            {apiKey.lastUsedAt && (
                                                <span>
                                                    Last used {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setKeyToRevoke(apiKey.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Key className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first API key to start using the PodNex API
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create API Key
                    </Button>
                </Card>
            )}

            {/* Revoke Confirmation */}
            <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently revoke this API key. Any applications using this key will no longer be able to access the API.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevoke} className="bg-destructive text-destructive-foreground">
                            Revoke
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
