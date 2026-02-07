export type Comment = {
  id: number;
  discussion_id: number;
  user_id: string;
  content: string | null;
  status: boolean | null;
  created_at: string;
  profiles?: {
    username: string | null;
  };
};
export type Profile = {
  user_id: string;
  username: string;
  role: string;
  phone?: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  member_count: number;
  join_code?: string;
  created_by?: string | null;
  created_at: Date;
};

export type Group_Member = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: Date;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: number;
  start_date: string;
  due_date: string;
  created_by: string;
  updated_at: string;
};

export type Discussion = {
  id: number;
  group_id: string;
  user_id: string;
  title: string;
  content: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};
