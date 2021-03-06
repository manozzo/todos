import React, {
  useState,
  useEffect
} from 'react';
import { useSession } from 'next-auth/client';
import AppBar from '../components/topBar/appBar.js';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '../components/navBar/drawer.js';
import {
  Box,
  InputBase,
  Typography,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemSecondaryAction,
  ListItemText,
  IconButton,
  List,
  Paper,
  FormHelperText
} from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Copyright from '../components/Copyright';
import { useForm } from 'react-hook-form';
import toast,
{ Toaster } from 'react-hot-toast';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddIcon from '@material-ui/icons/Add';


const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  root: {
    height: '100vh',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 0,
  },
  list: {
    width: '100%',
    maxWidth: 560,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  paper: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 560,
    backgroundColor: theme.palette.background.default,
  },
  helptext: {
    color: theme.palette.error.light,
  }
}));

function Home(props) {


  const [session, loading] = useSession();
  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm({ mode: "onChange" });
  const [data, setData] = useState(props.regsTodo);
  const [checked, setChecked] = React.useState([0]);

  const fetchData = async () => {
    const req = await fetch('http://localhost:3000/api/todo');
    const newData = await req.json();
    return setData(newData);
  };

  const onSubmit = async (data, e) => {

    const res = fetch('http://localhost:3000/api/todo', {
      method: "post",
      body: JSON.stringify(data)
    })

    toast.promise(res, {
      loading: 'Loading',
      success: 'Task Added',
      error: 'Error when fetching',
    })
    fetchData();
    e.target.reset();
  }

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleDelete = (_id) => () => {

    const res = fetch('http://localhost:3000/api/todo', {
      method: "delete",
      body: JSON.stringify(_id)
    })

    fetchData();

    toast.promise(res, {
      loading: 'Loading',
      success: 'Delete',
      error: 'Error when fetching',
    })
  }

  return (
    <Container>
      <AppBar />
      {/* para usar drawer lateral, ideal box display flex, para ficar side by side com o drawer */}
      <Box display="flex" justifyContent="center">
        {/* <Drawer /> */}
        {/* nesse box abaixo usar o my and pt de cima para ficar justificado */}
        <Box pt={12} >
          {!session && <>
            <Typography align="left" color="text" variant="h3" component="h1" gutterBottom>
              Simple like that. <br />
              Just to do list. <br />
              Do your day.
            </Typography>
          </>}
          {session && <>
            <Box>
              <Paper onSubmit={handleSubmit(onSubmit)} component="form" className={classes.paper}>
                <InputBase
                  placeholder="Task..."
                  className={classes.input}
                  inputRef={register({ required: "Task is required", maxLength: { value: 200, message: "Max lenght is 200 characters" } })}
                  type="text"
                  name="task"
                  inputProps={{
                    maxLength: 200,
                  }}
                />
                <IconButton color="inherit" type="submit" className={classes.iconButton} aria-label="add">
                  <AddIcon />
                </IconButton>
              </Paper>
              {errors.task && <FormHelperText className={classes.helptext}>{errors.task.message}</FormHelperText>}

              <p> Tasks: </p>
              <>
                <List className={classes.list}>
                  {data.data.map((regTodo) => {
                    const labelId = `checkbox-list-label-${regTodo._id}`;
                    return (
                      <ListItem divider key={regTodo._id} role={undefined} dense button onClick={handleToggle(regTodo._id)}>
                        <ListItemIcon color="inherit">
                          <Checkbox
                            edge="start"
                            checked={checked.indexOf(regTodo._id) !== -1}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemIcon>
                        <ListItemText style={{ textDecoration: checked.indexOf(regTodo._id) !== -1 ? "line-through" : "" }} id={labelId} primary={regTodo.task} />
                        <ListItemSecondaryAction>
                          <IconButton onClick={handleDelete(regTodo._id)} color="inherit" size="small" edge="end" aria-label="delete">
                            <DeleteForeverIcon size="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })
                  }
                </List>
              </>
            </Box>
          </>}
          <footer className={classes.footer}>
            <Copyright />
          </footer>
        </Box>
      </Box>
      <Toaster />
    </Container>

  )
}

//pegar dados do nosso banco de dados... por padrão GET
export async function getServerSideProps() {
  const res = await fetch('http://localhost:3000/api/todo')
  const regsTodo = await res.json()

  return {
    props: {
      regsTodo,
    }
  }
}

export default Home