
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { Users, Hash, FileText } from 'lucide-react';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createGroup } = useUser();

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) return;
    
    setIsLoading(true);
    try {
      await createGroup({
        name: groupName.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form
      setGroupName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupName, description, createGroup, onClose]);

  const handleClose = useCallback(() => {
    // Reset form when closing
    setGroupName('');
    setDescription('');
    setIsLoading(false);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Group Name *
            </Label>
            <Input
              id="groupName"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500">{groupName.length}/50 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500">{description.length}/200 characters</p>
          </div>

          {/* Group Type Selection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Group Settings</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center justify-between">
                <span>Visibility:</span>
                <span className="font-medium">Public</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Join Method:</span>
                <span className="font-medium">Open to All</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Anonymous Users:</span>
                <span className="font-medium">Allowed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>

          {/* Preview */}
          {groupName && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium">{groupName}</h4>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  <span>1 member</span>
                  <span className="mx-2">•</span>
                  <span>Just created</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
