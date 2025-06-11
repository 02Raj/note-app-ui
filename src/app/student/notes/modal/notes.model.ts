export interface Note {
    _id: string;
    title: string;
    content: string;
    topicName: string;
    subtopicName?: string; 
    revisionStage: number;
    revisionDueDate: string; 
    createdAt: string;
  }