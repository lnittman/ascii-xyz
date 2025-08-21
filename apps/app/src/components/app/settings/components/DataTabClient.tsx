'use client';

import { useState } from 'react';

import type { DataSettings } from '@repo/database/types';
import type { SharedLinkResponse } from '@repo/services/share';

import {
  useDataSettings,
  useUpdateDataSettings,
} from '@/hooks/settings/use-data-settings';
import { useSharedLinks } from '@/hooks/settings/use-shared-links';
import {
  useDeactivateSharedLink,
  useDeleteSharedLink,
} from '@/hooks/share/mutations';

import {
  Check,
  Clock,
  Copy,
  Download,
  Link,
  Trash,
} from '@phosphor-icons/react';

import { Button } from '@repo/design/components/ui/button';
import { Label } from '@repo/design/components/ui/label';
import { Switch } from '@repo/design/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design/components/ui/table';

interface DataTabClientProps {
  initialDataSettings?: DataSettings;
  initialLinks?: SharedLinkResponse[];
}

export function DataTabClient({
  initialDataSettings,
  initialLinks,
}: DataTabClientProps) {
  const { settings: dataSettings } = useDataSettings(initialDataSettings);
  const { updateDataSettings } = useUpdateDataSettings();
  const { sharedLinks, refresh } = useSharedLinks(initialLinks);
  const { deactivateSharedLink } = useDeactivateSharedLink();
  const { deleteSharedLink } = useDeleteSharedLink();
  const [linkCopied, setLinkCopied] = useState<string | null>(null);

  const handleDeactivateLink = async (id: string) => {
    try {
      await deactivateSharedLink(id);
      refresh();
    } catch (_error) {}
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteSharedLink(id);
      refresh();
    } catch (_error) {}
  };

  const handleCopyLink = (accessToken: string) => {
    navigator.clipboard.writeText(`https://yourapp.com/shared/${accessToken}`);
    setLinkCopied(accessToken);
    setTimeout(() => setLinkCopied(null), 2000);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Shared Links Section */}
      <div className="border-border/10 border-b pb-4">
        <div className="mb-6 rounded-none border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h4 className="mb-1 font-medium text-foreground text-sm">
                shared links
              </h4>
              <p className="text-muted-foreground text-xs">
                these links allow others to view specific chats without needing
                an account. active links can be accessed by anyone with the url.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="hide-warning"
                checked={dataSettings?.hideSharedWarning ?? false}
                onCheckedChange={(checked) =>
                  updateDataSettings({ hideSharedWarning: checked })
                }
              />
              <Label
                htmlFor="hide-warning"
                className="cursor-pointer text-foreground text-xs"
              >
                don't show again
              </Label>
            </div>
          </div>
        </div>

        {sharedLinks.length > 0 ? (
          <div className="overflow-hidden">
            <div className="overflow-auto rounded-none border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">chat</TableHead>
                    <TableHead className="text-foreground">created</TableHead>
                    <TableHead className="text-foreground">status</TableHead>
                    <TableHead className="text-right text-foreground">
                      actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium text-foreground">
                        {link.chatTitle}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(link.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-none px-2 py-0.5 font-medium text-xs ${
                            link.isActive
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {link.isActive ? 'active' : 'inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {link.isActive && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyLink(link.accessToken)}
                              >
                                {linkCopied === link.accessToken ? (
                                  <Check
                                    className="h-4 w-4 text-green-500"
                                    weight="duotone"
                                  />
                                ) : (
                                  <Copy
                                    className="h-4 w-4 text-muted-foreground"
                                    weight="duotone"
                                  />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeactivateLink(link.id)}
                              >
                                <Link
                                  className="h-4 w-4 text-muted-foreground"
                                  weight="duotone"
                                />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500/70 transition-all duration-300 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed p-6 text-center">
            <Link
              className="mb-2 h-10 w-10 text-muted-foreground"
              weight="duotone"
            />
            <h4 className="mb-1 font-medium text-foreground text-sm">
              no shared links yet
            </h4>
            <p className="mb-4 text-muted-foreground text-xs">
              create a shared link from any chat to give others access
            </p>
          </div>
        )}
      </div>

      {/* Data Export Section */}
      <div className="border-border/10 border-b pb-4">
        <h4 className="mb-4 font-medium text-foreground text-sm">
          export your data
        </h4>
        <p className="mb-4 text-muted-foreground text-sm">
          download all your data including chats, shared links, and preferences
          in a portable format
        </p>

        <div className="rounded-none border border-border/40 bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-primary/10 text-primary">
              <Download className="h-6 w-6" weight="duotone" />
            </div>
            <div className="flex-1">
              <h5 className="mb-0.5 font-medium text-foreground text-sm">
                complete data export
              </h5>
              <p className="text-muted-foreground text-xs">
                json format containing all your conversations and account data
              </p>
            </div>
            <Button variant="accent" className="rounded-none">
              <Download className="mr-2 h-4 w-4" />
              export
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy Settings Section */}
      <div>
        <h4 className="mb-4 font-medium text-foreground text-sm">
          privacy settings
        </h4>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="analytics"
                className="font-medium text-foreground text-sm"
              >
                usage analytics
              </Label>
              <p className="text-muted-foreground text-xs">
                allow anonymous usage data collection to improve our service
              </p>
            </div>
            <Switch
              id="analytics"
              checked={dataSettings?.usageAnalyticsEnabled ?? true}
              onCheckedChange={(checked) =>
                updateDataSettings({ usageAnalyticsEnabled: checked })
              }
              className="rounded-none"
            />
          </div>
        </div>

        <div>
          <h4 className="mb-4 border-border/40 border-t border-b p-2 font-medium text-red-500 text-sm">
            danger zone
          </h4>

          <div className="rounded-none border border-red-500/20 bg-red-500/5 p-4">
            <h5 className="mb-1 font-medium text-foreground text-sm">
              delete account data
            </h5>
            <p className="mb-3 text-muted-foreground text-xs">
              this will permanently delete all your chats, shared links, and
              settings. this action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-500/70 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
            >
              delete all data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
