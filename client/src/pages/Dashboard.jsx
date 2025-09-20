import clsx from "clsx";
import moment from "moment";
import React, { useEffect } from "react";
import { FaNewspaper } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import { LuClipboardEdit } from "react-icons/lu";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { Chart, Loading, UserInfo } from "../components";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { LabelList } from 'recharts';
import { useGetDasboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import { useSelector } from "react-redux";

const Card = ({ label, count, bg, icon }) => {
  return (
    <div className='w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between'>
      <div className='h-full flex flex-1 flex-col justify-between'>
        <p className='text-base text-gray-600'>{label}</p>
        <span className='text-2xl font-semibold'>{count}</span>
        <span className='text-sm text-gray-400'>{"111 last month"}</span>
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center text-white",
          bg
        )}
      >
        {icon}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { data, isLoading, error } = useGetDasboardStatsQuery();
  React.useEffect(() => {
    // Permanent debug log for dashboard API response
    console.log('[Dashboard] API data:', data);
    if (error) console.error('[Dashboard] API error:', error);
  }, [data, error]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const totals = data?.tasks || {};


  if (isLoading) {
    return (
      <div className='py-10'>
        <Loading />
      </div>
    );
  }

  if (!data) {
    return (
      <div className='py-10 text-center text-gray-500'>
        No dashboard data available.
      </div>
    );
  }

  const stats = [
    {
      id: "1",
      label: "TOTAL TASK",
      total: data?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      id: "2",
      label: "COMPLTED TASK",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      id: "3",
      label: "TASK IN PROGRESS ",
      total: totals["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      id: "4",
      label: "TODOS",
      total: totals["todo"] || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]" || 0,
    },
  ];

  return (
    <div className='h-full py-4'>
      <>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
          {stats?.map(({ icon, bg, label, total }, index) => (
            <Card key={index} icon={icon} bg={bg} label={label} count={total} />
          ))}
        </div>

        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-8 my-16'>
          {/* Donut Chart for Task Distribution */}
          <div className='bg-white p-4 rounded shadow flex flex-col items-center'>
            <h3 className='text-lg font-semibold mb-2'>Task Distribution</h3>
            <PieChart width={220} height={220}>
              <Pie
                data={[{ name: 'Pending', value: totals['todo'] || 0 }, { name: 'In Progress', value: totals['in progress'] || 0 }, { name: 'Completed', value: totals['completed'] || 0 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {["#f59e0b", "#06b6d4", "#22c55e"].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className='flex gap-4 mt-2'>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#f59e0b"}}></span> Pending</span>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#06b6d4"}}></span> In Progress</span>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#22c55e"}}></span> Completed</span>
            </div>
          </div>
          {/* Bar Chart for Task Priority Levels */}
          <div className='bg-white p-4 rounded shadow flex flex-col items-center'>
            <h3 className='text-lg font-semibold mb-2'>Task Priority Levels</h3>
            <BarChart width={420} height={220} data={[
              { name: 'Low', value: data?.graphData?.find(d => d.name === 'low')?.total ?? 0 },
              { name: 'Normal', value: data?.graphData?.find(d => d.name === 'normal')?.total ?? 0 },
              { name: 'Medium', value: data?.graphData?.find(d => d.name === 'medium')?.total ?? 0 },
              { name: 'High', value: data?.graphData?.find(d => d.name === 'high')?.total ?? 0 },
            ]}>
              <XAxis dataKey="name" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                <Cell key="low" fill="#38bdf8" />
                <Cell key="normal" fill="#a3e635" />
                <Cell key="medium" fill="#f59e0b" />
                <Cell key="high" fill="#ef4444" />
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
            <div className='flex gap-4 mt-2'>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#38bdf8"}}></span> Low</span>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#a3e635"}}></span> Normal</span>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#f59e0b"}}></span> Medium</span>
              <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full' style={{background: "#ef4444"}}></span> High</span>
            </div>
          </div>
        </div>
        <div className='w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8'>
          {/* RECENT AUTHORS */}
          {data && <TaskTable tasks={data?.last10Task || []} />}
        </div>
      </>
    </div>
  );
};

const TaskTable = ({ tasks }) => {
  const { user } = useSelector((state) => state.auth);

  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className='border-b border-gray-300 dark:border-gray-600'>
      <tr className='text-black dark:text-white  text-left'>
        <th className='py-2'>Task Title</th>
        <th className='py-2'>Priority</th>
        <th className='py-2'>Team</th>
        <th className='py-2 hidden md:block'>Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
        <div className='flex items-center gap-2'>
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className='text-base text-black dark:text-gray-400'>
            {task?.title}
          </p>
        </div>
      </td>
      <td className='py-2'>
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className='capitalize'>{task?.priority}</span>
        </div>
      </td>

      <td className='py-2'>
        <div className='flex'>
          {task?.team.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className='py-2 hidden md:block'>
        <span className='text-base text-gray-600'>
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );

  return (
    <>
      <div
        className={clsx(
          "w-full bg-white dark:bg-[#1f1f1f] px-2 md:px-4 pt-4 pb-4 shadow-md rounded",
          user?.isAdmin ? "md:w-2/3" : ""
        )}
      >
        <table className='w-full '>
          <TableHeader />
          <tbody className=''>
            {tasks.map((task, id) => (
              <TableRow key={task?.id + id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;
