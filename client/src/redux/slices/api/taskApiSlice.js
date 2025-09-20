import { TASKS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";
    
    


export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateTaskPriority: builder.mutation({
      query: ({ id, priority }) => ({
        url: `${TASKS_URL}/${id}/change-priority/`,
        method: "PUT",
        body: { priority },
        credentials: "include",
      }),
    }),
    createTask: builder.mutation({
      query: (data) => ({
        url: `${TASKS_URL}/`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    duplicateTask: builder.mutation({
      query: (id) => ({
        url: `${TASKS_URL}/duplicate/${id}/`,
        method: "POST",
        body: {},
        credentials: "include",
      }),
    }),

    updateTask: builder.mutation({
      query: (data) => ({
        url: `${TASKS_URL}/${data.id}/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    getAllTask: builder.query({
      query: ({ strQuery, isTrashed, search }) => ({
        url: `${TASKS_URL}/?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getSingleTask: builder.query({
      query: (id) => {
        if (!id || isNaN(Number(id))) {
          console.error('[API] Attempted to fetch task with invalid id:', id);
          // Return a dummy endpoint that will never match
          return {
            url: `${TASKS_URL}/0/`,
            method: "GET",
            credentials: "include",
            skip: true,
          };
        }
        return {
          url: `${TASKS_URL}/${id}/`,
          method: "GET",
          credentials: "include",
        };
      },
    }),

    createSubTask: builder.mutation({
      query: ({ data, id }) => ({
        url: `${TASKS_URL}/${id}/subtask/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    postTaskActivity: builder.mutation({
      query: ({ data, id }) => ({
        url: `${TASKS_URL}/${id}/activity/`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    trashTast: builder.mutation({
      query: ({ id }) => ({
        url: `${TASKS_URL}/${id}/`,
        method: "PUT",
        credentials: "include",
      }),
    }),

    deleteRestoreTast: builder.mutation({
      query: ({ id, actionType }) => ({
        url: `${TASKS_URL}/${id}/delete-restore/?actionType=${actionType}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    getDasboardStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/dashboard/`,
        method: "GET",
        credentials: "include",
      }),
    }),

    changeTaskStage: builder.mutation({
      query: (data) => ({
        url: `${TASKS_URL}/${data?.id}/change-stage/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    changeSubTaskStatus: builder.mutation({
      query: (data) => ({
        url: `${TASKS_URL}/${data?.id}/change-status/${data?.subId}/`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
     
    getDasboardStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/dashboard/`,
        method: "GET",
        credentials: "include",
      }),
    }),
    
  }),
});

export const {
  usePostTaskActivityMutation,
  useCreateTaskMutation,
  useGetAllTaskQuery,
  useCreateSubTaskMutation,
  useTrashTastMutation,
  useDeleteRestoreTastMutation,
  useDuplicateTaskMutation,
  useUpdateTaskMutation,
  useGetSingleTaskQuery,
  useGetDasboardStatsQuery,
  useChangeTaskStageMutation,
  useChangeSubTaskStatusMutation,
  useUpdateTaskPriorityMutation,
} = postApiSlice;
