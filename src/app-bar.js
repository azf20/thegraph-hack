import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import MuiAppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import GitHubIcon from '@material-ui/icons/GitHub';

const styles = {
	root: {
		flexGrow: 1
	},
	flex: {
		flex: 1
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20
	}
}

const AppBar = props => {
	const { classes, title, githubLink } = props
	return (
		<div className={classes.root}>
			<MuiAppBar position="static">
				<Toolbar>
					<Typography variant="h5" color="inherit" className={classes.flex}>
						{title}
					</Typography>
					{!!githubLink && (
						<IconButton color="inherit" href={githubLink ? `${githubLink}` : undefined}>
							<GitHubIcon />
						</IconButton>
					)}
				</Toolbar>
			</MuiAppBar>
		</div>
	)
}

AppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	githubUser: PropTypes.string
}

export default withStyles(styles)(AppBar)
