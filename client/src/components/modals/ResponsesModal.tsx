
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormResponse } from '@/types/form';
import { apiRequest } from '@/lib/queryClient';

interface ResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: number;
}

export function ResponsesModal({ isOpen, onClose, formId }: ResponsesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  const { data: responses = [], isLoading, error } = useQuery<FormResponse[]>({
    queryKey: ['/api/forms', formId, 'responses'],
    queryFn: () => formId ? apiRequest('GET', `/api/forms/${formId}/responses`).then(res => res.json()) : Promise.resolve([]),
    enabled: !!formId && isOpen,
  });

  const filteredResponses = responses.filter(response => {
    if (!searchTerm) return true;
    const searchValue = searchTerm.toLowerCase();
    return Object.values(response.data).some(value => 
      String(value).toLowerCase().includes(searchValue)
    );
  });

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;

    // Get all unique field names
    const allFields = new Set<string>();
    responses.forEach(response => {
      Object.keys(response.data).forEach(key => allFields.add(key));
    });

    const headers = ['Response ID', 'Submitted At', 'Status', ...Array.from(allFields)];
    const csvContent = [
      headers.join(','),
      ...responses.map(response => [
        response.id,
        response.createdAt ? new Date(response.createdAt).toLocaleString() : '',
        response.isComplete ? 'Complete' : 'Draft',
        ...Array.from(allFields).map(field => `"${formatValue(response.data[field] || '')}"`)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const ResponseDetails = ({ response }: { response: FormResponse }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="font-semibold text-lg">Response #{response.id}</h3>
          <p className="text-sm text-gray-500">
            {response.createdAt ? new Date(response.createdAt).toLocaleString() : 'Unknown date'}
          </p>
        </div>
        <Badge variant={response.isComplete ? "default" : "secondary"}>
          {response.isComplete ? 'Complete' : 'Draft'}
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {Object.entries(response.data).map(([field, value]) => (
          <div key={field} className="bg-gray-50 rounded-lg p-3">
            <Label className="text-sm font-medium text-gray-700 mb-1 block capitalize">
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Label>
            <div className="text-sm text-gray-900">
              {formatValue(value) || <span className="text-gray-400 italic">No response</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!formId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Form Selected</DialogTitle>
            <DialogDescription className="sr-only">
              You need to save your form first before viewing responses
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <i className="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">Please save your form first to view responses.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-bar text-white"></i>
              </div>
              <span>Form Responses</span>
              <Badge variant="outline" className="ml-2">
                {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="sr-only">
              View and analyze form responses with search, export, and analytics features
            </DialogDescription>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                disabled={responses.length === 0}
              >
                <i className="fas fa-download mr-2"></i>
                Export CSV
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="list" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center space-x-2">
                <i className="fas fa-list"></i>
                <span>All Responses</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <i className="fas fa-chart-pie"></i>
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1 space-y-4 overflow-hidden">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <Input
                      placeholder="Search responses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">Loading responses...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <i className="fas fa-exclamation-triangle text-2xl text-red-400 mb-4"></i>
                  <p className="text-red-600">Failed to load responses</p>
                </div>
              ) : filteredResponses.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {responses.length === 0 ? 'No responses yet' : 'No matching responses'}
                  </h3>
                  <p className="text-gray-500">
                    {responses.length === 0 
                      ? 'Share your form to start collecting responses!' 
                      : 'Try adjusting your search term.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                  {/* Responses List */}
                  <div className="space-y-3 overflow-y-auto max-h-96">
                    {filteredResponses.map((response) => (
                      <Card 
                        key={response.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedResponse?.id === response.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedResponse(response)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              Response #{response.id}
                            </CardTitle>
                            <Badge variant={response.isComplete ? "default" : "secondary"} className="text-xs">
                              {response.isComplete ? 'Complete' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {response.createdAt ? new Date(response.createdAt).toLocaleString() : 'Unknown date'}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-gray-600">
                            {Object.keys(response.data).length} fields completed
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Response Details */}
                  <div className="bg-gray-50 rounded-lg p-4 overflow-y-auto max-h-96">
                    {selectedResponse ? (
                      <ResponseDetails response={selectedResponse} />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-mouse-pointer text-3xl mb-4"></i>
                        <p>Select a response to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                      Total Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <i className="fas fa-check-circle mr-2 text-green-600"></i>
                      Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {responses.filter(r => r.isComplete).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <i className="fas fa-clock mr-2 text-orange-600"></i>
                      Drafts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {responses.filter(r => !r.isComplete).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
