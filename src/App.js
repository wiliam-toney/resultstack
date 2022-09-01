import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { Container, Input, Table, Alert } from 'reactstrap';
import GitAPIs from './GitAPIs';
import Avatar from 'react-avatar';
import moment from 'moment';
import Pagination from "./components/Pagination";

function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 30;

  const doGitSearchWithQuery = useCallback(async (q, page = 1) => {
    try {
      const params = {
        q,
        page,
        per_page: itemsPerPage
      }
      const resp = await GitAPIs.searchUsers(params);
      const { items, total_count } = resp.data;
      setUsers(items);
      setTotalCount(total_count < 1000 ? total_count : 1000);  // we do this because git api returns only for the first 1,000 search results
      // Get git user details for each user
      items.forEach(item => getGitUserDetails(item.login))
    } catch (e) {
      setError(e.response?.data?.message ?? e.message);
    }
  }, [])

  useEffect(() => {
    if (query) {
      doGitSearchWithQuery(query);
    } else {
      setUsers([]);
    }
  }, [query, doGitSearchWithQuery]);

  const onChangeSearchQuery = (e) => {
    setQuery(e.target.value);
  }

  const getGitUserDetails = async (userId) => {
    try {
      const resp = await GitAPIs.getUserDetails(userId);
      const userDetails = resp.data;
      setUsers(prev => {
        const index = prev.findIndex(u => u.login === userId);
        if (index !== -1) {
          prev[index] = userDetails;
        }
        return [...prev];
      })
    } catch (e) {
      setError(e.response?.data?.message ?? e.message);
    }
  }

  const memoizedTable = useMemo(() => {
    return (
      <Table>
        <thead>
          <tr>
            <th>
              Username
            </th>
            <th>
              Avatar
            </th>
            <th>
              Location
            </th>
            <th>
              Real name
            </th>
            <th>
              Email
            </th>
            <th>
              Count of Repo
            </th>
            <th>
              Created At
            </th>
            <th>
              Updated At
            </th>
          </tr>
        </thead>
        <tbody>
          {
            users.map(user => (
              <tr key={user.login}>
                <td>
                  <a href={user.html_url} target='__blank'>
                    {user.login ?? ""}
                  </a>
                </td>
                <td>
                  <Avatar src={user.avatar_url} name={user.name} />
                </td>
                <td>
                  {user.location ?? ""}
                </td>
                <td>
                  {user.name ?? ""}
                </td>
                <td>
                  {user.email ?? ""}
                </td>
                <td>
                  {user.public_repos ?? ""}
                </td>
                <td>
                  {user.created_at ? moment(user.created_at).format("DD-MM-YYYY HH:mm:ss") : ""}
                </td>
                <td>
                  {user.updated_at ? moment(user.updated_at).format("DD-MM-YYYY HH:mm:ss") : ""}
                </td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    )
  }, [users]);

  const handlePageClick = ({ selected }) => {
    doGitSearchWithQuery(query, selected + 1)
  }

  const hideError = () => {
    setError('');
  }

  return (
    <Container fluid='sm' className='mt-4'>
      <Input placeholder='Search user' value={query} onChange={onChangeSearchQuery} />
      {
        !!error && <Alert color='danger' toggle={hideError} className='my-2'>{error}</Alert>
      }
      {
        users?.length > 0 && memoizedTable
      }
      <Pagination
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={Math.ceil(totalCount / itemsPerPage)}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
    </Container>
  );
}

export default App;
