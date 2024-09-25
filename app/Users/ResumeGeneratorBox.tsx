import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const ResumeGeneratorBox = () => {
  const aiWebsites = [
    { name: 'Zety', icon: FileText, url: 'https://zety.com/' },
    { name: 'resume.io', icon: FileText, url: 'https://resume.io/' },
    { name: 'enhancv', icon: FileText, url: 'https://enhancv.com/' },
    { name: 'Kickresume', icon: FileText, url: 'https://www.kickresume.com/' },
  ];

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-2xl shadow-black/20">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Generate Your Resume Here</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {aiWebsites.map((site, index) => (
            <a
              key={index}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-background text-foreground hover:scale-110 transition-transform"
            >
              <site.icon className="w-8 h-8 mb-2" />
              <span className="text-sm text-center">{site.name}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeGeneratorBox;