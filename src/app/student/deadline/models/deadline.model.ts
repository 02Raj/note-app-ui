export interface Deadline {
    _id: string;
    title: string;
    dueDate: Date;
    status: 'pending' | 'completed' | 'missed';
    topicId?: { // topicId populate hoke aayega, isliye object
      _id: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }