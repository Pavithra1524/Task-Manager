import { useUpdateTaskPriorityMutation } from '../../redux/slices/api/taskApiSlice';
const PRIORITIES = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Normal', value: 'normal' },
  { label: 'Low', value: 'low' },
];
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useChangeTaskStageMutation,
  useDuplicateTaskMutation,
  useTrashTastMutation,
} from "../../redux/slices/api/taskApiSlice";
import ConfirmatioDialog from "../ConfirmationDialog";
import AddSubTask from "./AddSubTask";
import AddTask from "./AddTask";
import TaskColor from "./TaskColor";
import { useSelector } from "react-redux";
import React, { forwardRef } from "react";

const CustomTransition = ({ children }) => (
  <Transition
    as={Fragment}
    enter='transition ease-out duration-100'
    enterFrom='transform opacity-0 scale-95'
    enterTo='transform opacity-100 scale-100'
    leave='transition ease-in duration-75'
    leaveFrom='transform opacity-100 scale-100'
    leaveTo='transform opacity-0 scale-95'
  >
    {children}
  </Transition>
);

import { useGetAllTaskQuery } from '../../redux/slices/api/taskApiSlice';
const ChangeTaskActions = forwardRef(function ChangeTaskActions({ id, stage }, ref) {
  // Only allow numeric IDs
  if (!id || isNaN(Number(id))) return null;
  console.log('[ChangeTaskActions] id:', id, 'stage:', stage);
  const [changeStage] = useChangeTaskStageMutation();
  const { refetch } = useGetAllTaskQuery({ strQuery: '', isTrashed: '', search: '' });

  const changeHanlder = async (val) => {
    if (!id || isNaN(Number(id))) {
      toast.error('Invalid task ID. Cannot change stage.');
      return;
    }
    try {
      const data = {
        id: id,
        stage: val,
      };
      const res = await changeStage(data).unwrap();
      toast.success(res?.message);
      if (typeof refetch === 'function') refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const items = [
    {
      label: "To-Do",
      stage: "todo",
      icon: <TaskColor className='bg-blue-600' />,
      onClick: () => changeHanlder("todo"),
    },
    {
      label: "In Progress",
      stage: "in progress",
      icon: <TaskColor className='bg-yellow-600' />,
      onClick: () => changeHanlder("in progress"),
    },
    {
      label: "Completed",
      stage: "completed",
      icon: <TaskColor className='bg-green-600' />,
      onClick: () => changeHanlder("completed"),
    },
  ];

  return (
    <>
      <Menu as='div' className='relative inline-block text-left' ref={ref}>
        <Menu.Button
          className={clsx(
            "inline-flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300"
          )}
        >
          <FaExchangeAlt />
          <span>Change Task</span>
        </Menu.Button>

        <CustomTransition>
          <Menu.Items className='absolute p-4 left-0 mt-2 w-40 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
            <div className='px-1 py-1 space-y-2'>
              {items.map((el) => (
                <Menu.Item key={el.label} disabled={stage === el.stage}>
                  {({ active }) => (
                    <button
                      disabled={stage === el.stage}
                      onClick={el?.onClick}
                      className={clsx(
                        active ? "bg-gray-200 text-gray-900" : "text-gray-900",
                        "group flex gap-2 w-full items-center rounded-md px-2 py-2 text-sm disabled:opacity-50"
                      )}
                    >
                      {el.icon}
                      {el.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </CustomTransition>
      </Menu>
    </>
  );
});

export default function TaskDialog({ task }) {
  // Debug: log the task object and id
  console.log('[TaskDialog] task:', task, 'id:', task?.id);
  const [updatePriority] = useUpdateTaskPriorityMutation();
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();

  const [deleteTask] = useTrashTastMutation();
  const [duplicateTask] = useDuplicateTaskMutation();

  const deleteClicks = () => {
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    if (!task?.id) return;
    try {
      const res = await deleteTask({
        id: task.id,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const duplicateHanlder = async () => {
    if (!task?.id) return;
    try {
      const res = await duplicateTask(task.id).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => task?.id && navigate(`/task/${task.id}`),
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => setOpenEdit(true),
    },
    {
      label: "Add Sub-Task",
      icon: <MdAdd className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => setOpen(true),
    },
    {
      label: "Duplicate",
      icon: <HiDuplicate className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => duplicateHanlder(),
    },
    {
      label: "Change Task",
      icon: <FaExchangeAlt className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => setShowChangeTask((v) => !v),
    },
    {
      label: "Change Priority",
      icon: <MdOutlineEdit className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => setPriorityMenuOpen((v) => !v),
    },
  ];
  // State for showing Change Task dropdown
  const [showChangeTask, setShowChangeTask] = useState(false);
  // Priority change handler
  const handlePriorityChange = async (priority) => {
    if (!task?.id) return;
    setPriorityLoading(true);
    try {
      await updatePriority({ id: task.id, priority }).unwrap();
      toast.success('Priority updated');
      setPriorityMenuOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setPriorityLoading(false);
    }
  };

  return (
    <>
      <div className=''>
        <Menu as='div' className='relative inline-block text-left'>
          <Menu.Button className='inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300'>
            <BsThreeDots />
          </Menu.Button>

          <CustomTransition>
            <Menu.Items className='absolute p-4 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
              <div className='px-1 py-1 space-y-2'>
                {items.map((el, index) => (
                  <Menu.Item key={el.label}>
                    {({ active }) => (
                      <button
                        disabled={index === 0 ? false : !user.isAdmin}
                        onClick={el?.onClick}
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400`}
                      >
                        {el.icon}
                        {el.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className='px-1 py-1'>
                {task?.id && !isNaN(Number(task.id)) && (
                  <Menu.Item>
                    {() => <ChangeTaskActions id={task.id} stage={task.stage} />}
                  </Menu.Item>
                )}
                {/* Change Task Dropdown */}
                {showChangeTask && task?.id && !isNaN(Number(task.id)) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded shadow border border-gray-200">
                    <div className="mb-2 font-semibold text-xs text-gray-700">Change Task Stage</div>
                    <ChangeTaskActions id={task.id} stage={task.stage} />
                  </div>
                )}
                {/* Change Priority Dropdown */}
                {priorityMenuOpen && (
                  <div className="mt-2 p-2 bg-gray-50 rounded shadow border border-gray-200">
                    <div className="mb-2 font-semibold text-xs text-gray-700">Change Priority</div>
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        disabled={priorityLoading || task.priority === p.value}
                        onClick={() => handlePriorityChange(p.value)}
                        className={`block w-full text-left px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 ${task.priority === p.value ? 'font-bold text-blue-600' : ''}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className='px-1 py-1'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      disabled={!user.isAdmin}
                      onClick={() => deleteClicks()}
                      className={`${
                        active ? "bg-red-100 text-red-900" : "text-red-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400`}
                    >
                      <RiDeleteBin6Line
                        className='mr-2 h-5 w-5 text-red-600'
                        aria-hidden='true'
                      />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </CustomTransition>
        </Menu>
      </div>

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={task}
        key={new Date().getTime()}
      />
      <AddSubTask open={open} setOpen={setOpen} />
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
}
