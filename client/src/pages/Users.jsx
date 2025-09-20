import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { toast } from "sonner";
import {
  AddUser,
  Button,
  ConfirmatioDialog,
  Loading,
  Title,
  UserAction,
} from "../components";
import {
  useDeleteUserMutation,
  useGetTeamListsQuery,
  useUserActionMutation,
} from "../redux/slices/api/userApiSlice";
import { getInitials } from "../utils/index";
import { useSearchParams } from "react-router-dom";
import { useToggleUserStatusMutation } from "../redux/slices/api/userApiSlice";



const userStatusClick = async (userId, newStatus) => {
  console.log("Toggling user:", userId, "New status:", newStatus);
  try {
    const res = await toggleUserStatus({ id: userId, isActive: newStatus }).unwrap();
    toast.success(res?.message || "User status updated successfully!");
  } catch (err) {
    toast.error(err?.data?.message || "Failed to update user status");
  }
};

const Users = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");

  const { data, isLoading, refetch } = useGetTeamListsQuery({
    search: searchTerm,
  });
  const [deleteUser] = useDeleteUserMutation();
  const [userAction] = useUserActionMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };

 

  const deleteHandler = async () => {
    try {
      const res = await deleteUser(selected);

      refetch();
      toast.success(res?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const userActionHandler = async () => {
    try {
      const res = await userAction({
        isActive: !selected?.isActive,
  id: selected?.id,
      });

      refetch();
      toast.success(res?.data?.message);
      setSelected(null);
      setTimeout(() => {
        setOpenAction(false);
      }, 500);
    } catch (error) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    refetch();
  }, [open]);

  const TableHeader = () => (
    <thead className='border-b border-gray-300 dark:border-gray-600'>
      <tr className='text-black dark:text-white  text-left'>
        <th className='py-2'>Full Name</th>
        <th className='py-2'>Title</th>
        <th className='py-2'>Email</th>
        <th className='py-2'>Role</th>
        
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='p-2'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700'>
            <span className='text-xs md:text-sm text-center'>
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>
      <td className='p-2'>{user.title || user.role}</td>
      <td className='p-2'>{user.email}</td>
      <td className='p-2'>{user.role || user.title}</td>
      <td className='p-2 flex gap-2 justify-end'>
        <Button
          className='bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors duration-150 border border-green-700'
          label='Edit'
          type='button'
          onClick={() => editClick(user)}
        />
        <Button
          className='bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors duration-150 border border-pink-700'
          label='Delete'
          type='button'
          onClick={() => deleteClick(user?._id)}
        />
      </td>
    </tr>
  );

  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='  Team Members' />

          <Button
            label='Add New User'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5'
            onClick={() => setOpen(true)}
          />
        </div>
        <div className='bg-white dark:bg-[#1f1f1f] px-2 md:px-4 py-4 shadow rounded'>
          <div className='overflow-x-auto'>
            <table className='w-full mb-5'>
              <TableHeader />
              <tbody>
                {data?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;
