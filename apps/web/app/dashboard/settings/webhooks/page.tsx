"use client";

import { useState } from "react";
import { useWebhooks, useCreateWebhook, useDeleteWebhook, useUpdateWebhook, useSendTestWebhook } from "@/lib/hooks";
import type { WebhookEvent } from "@/lib/api/webhooks.api";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
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
import { Webhook, Plus, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; description: string }[] = [
    { value: "PODCAST_CREATED", label: "Podcast Created", description: "When a new podcast is created" },
    { value: "PODCAST_PROCESSING", label: "Podcast Processing", description: "When podcast generation starts" },
    { value: "PODCAST_COMPLETED", label: "Podcast Completed", description: "When podcast generation completes" },
    { value: "PODCAST_FAILED", label: "Podcast Failed", description: "When podcast generation fails" },
];

export default function WebhooksPage() {
    const { data: webhooks, isLoading } = useWebhooks();
    const createMutation = useCreateWebhook();
    const deleteMutation = useDeleteWebhook();
    const updateMutation = useUpdateWebhook();
    const testMutation = useSendTestWebhook();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
    const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!webhookUrl.trim()) {
            toast.error("Please enter a webhook URL");
            return;
        }
        if (selectedEvents.length === 0) {
            toast.error("Please select at least one event");
            return;
        }

        await createMutation.mutateAsync({
            url: webhookUrl,
            events: selectedEvents,
        });

        setWebhookUrl("");
        setSelectedEvents([]);
        setShowCreateForm(false);
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        await updateMutation.mutateAsync({
            id,
            data: { active },
        });
    };

    const handleDelete = async () => {
        if (!webhookToDelete) return;
        await deleteMutation.mutateAsync(webhookToDelete);
        setWebhookToDelete(null);
    };

    const handleTest = async (id: string) => {
        await testMutation.mutateAsync(id);
    };

    const toggleEvent = (event: WebhookEvent) => {
        setSelectedEvents((prev) =>
            prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-semibold">Webhooks</h1>
                    <p className="text-muted-foreground mt-2">
                        Receive real-time notifications about your podcasts
                    </p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Webhook
                </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Create New Webhook</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Webhook URL</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://your-domain.com/webhook"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Events to Subscribe</Label>
                            {WEBHOOK_EVENTS.map((event) => (
                                <div key={event.value} className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id={event.value}
                                        checked={selectedEvents.includes(event.value)}
                                        onChange={() => toggleEvent(event.value)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor={event.value} className="font-medium cursor-pointer">
                                            {event.label}
                                        </label>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                </div>
                            ))}
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

            {/* Webhooks List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : webhooks && webhooks.length > 0 ? (
                <div className="space-y-4">
                    {webhooks.map((webhook) => (
                        <Card key={webhook.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Webhook className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <code className="text-sm font-mono">{webhook.url}</code>
                                            <Badge variant={webhook.active ? "default" : "secondary"}>
                                                {webhook.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {webhook.events.map((event) => (
                                                <Badge key={event} variant="outline" className="text-xs">
                                                    {event.replace("PODCAST_", "").replace("_", " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                Created {formatDistanceToNow(new Date(webhook.createdAt), { addSuffix: true })}
                                            </span>
                                            {webhook._count && (
                                                <span>{webhook._count.deliveries} deliveries</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActive(webhook.id, !webhook.active)}
                                    >
                                        {webhook.active ? "Disable" : "Enable"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTest(webhook.id)}
                                        disabled={testMutation.isPending}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setWebhookToDelete(webhook.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Webhook className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No webhooks yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first webhook to receive real-time notifications
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Webhook
                    </Button>
                </Card>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!webhookToDelete} onOpenChange={() => setWebhookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this webhook. You will no longer receive notifications for this endpoint.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
