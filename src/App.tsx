import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

interface UserData {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  public_repos: number;
}

interface RepoData {
  id: number;
  name: string;
  stargazers_count: number;
}

type Data = UserData | RepoData[];

const fetchData = async (endpoint: string): Promise<Data | null> => {
  try {
    const response = await fetch(endpoint);
    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    
    console.error('Error fetching data:', error);
    return null;
  }
};

interface SearchPanelProps {
  onChangeParams: (type: string, query: string) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onChangeParams }) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleSearch = () => {
    if (selectRef.current && inputRef.current) {
      onChangeParams(selectRef.current.value, inputRef.current.value);
    }
  };

  return (
    <div>
      <input type="text" ref={inputRef} onChange={onChangeInput} placeholder='введите имя пользователя и название репозитория' />
      <select ref={selectRef}>
        <option value="users">User</option>
        <option value="repos">Repo</option>
      </select>
      <button onClick={handleSearch} disabled={!inputValue}>Get</button>
    </div>
  );
};

interface DisplayDataProps {
  data: Data | null;
  type: string;
}

interface ViewUserDataProps {
  data: UserData
}
const ViewUserData: React.FC<ViewUserDataProps> = ({data}) => {
  return (
    <div>
      <p>Name: {data.name}</p>
      <p>Number of Repositories: {data.public_repos}</p>
    </div>
  );
} 
interface ViewRepoDataProps {
  data: RepoData[]
}
 const ViewRepoData: React.FC<ViewRepoDataProps> = ({data}) => {
  return (
    <div>
      {data.length ? (data.map((item, index) => 
      <div key={index}>
      <p>Repository Name: {item.name}</p>
      <p>Number of Stars: {item.stargazers_count}</p>
    </div>
    )) : (<p>not found</p>) }
    
    
    </div>
  );
 }
const DisplayData: React.FC<DisplayDataProps> = ({ data, type }) => {
  if (!data) {
    return (
    <p>Loading...</p>
  )}

  if (type === 'users') {
    const userData = data as UserData;
    return (<ViewUserData data={userData}/>)
  } else {
    const repoData = data as RepoData[];
    return (<ViewRepoData data={repoData}/>);
  }
};

const App: React.FC = () => {
  const [params, setParams] = useState({ selectValue: 'users', inputValue: 'unoname' });
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const endpoint =
      params.selectValue === 'users'
        ? `https://api.github.com/users/${params.inputValue}`
        : `https://api.github.com/users/${params.inputValue}/repos`;
    fetchData(endpoint).then((resData) => setData(resData));
  }, [params]);

  const onChangeParams = useCallback((selectValue: string, inputValue: string) => {
    setParams({ selectValue, inputValue })}, []);
 

  return (
    <div>
      <SearchPanel onChangeParams={onChangeParams} />
      <DisplayData data={data} type={params.selectValue} />     
    </div>
  );
};

export default App;
