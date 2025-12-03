import React from 'react';
import MainLayout from './MainLayout';
import AdvancedExample from './AdvancedExample';

/**
 * SharePoint Demo - Mock SharePoint UI with sidebar and Gantt chart
 * This is just for demo purposes to show how it would look in SharePoint
 * The layout (sidebar) is only for demo - the actual GanttChart component
 * can be used standalone in SharePoint pages
 */
const SharePointDemo = () => {
  return (
    <MainLayout>
      <div style={{ padding: '0', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdvancedExample />
      </div>
    </MainLayout>
  );
};

export default SharePointDemo;
