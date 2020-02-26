import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { userShape } from './UserPropTypes';
import { DynamicFormattedMessage } from '../../../HelperComponent/DynamicFormattedMessage';

export const CreateUserForm = (props) => {
	const {
		user,
		errors,
		valid,
		disabled,
		pristine,
		passwordConfirmation,
		intl,
		onUsernameUpdate,
		onEmailUpdate,
		onFirstNameUpdate,
		onLastNameUpdate,
		onPasswordUpdate,
		onPasswordConfirmationUpdate,
		onFieldUpdate,
		additionalFields,
		onCancel,
		onSubmit
	} = props;

	const errorsMappings = {
		EMAIL_INVALID: intl.formatMessage({ id: 'Admin.User.errorEMailInvalid' }, {}),
		EMAIL_IN_USE: intl.formatMessage({ id: 'Admin.User.errorEMailInUse' }, {}),
		EMAIL_REQUIRED: intl.formatMessage({ id: 'Admin.User.errorEMailRequired' }, {}),
		USERNAME_REQUIRED: intl.formatMessage({ id: 'Admin.User.errorUsernameRequired' }, {}),
		USERNAME_IN_USE: intl.formatMessage({ id: 'Admin.User.errorUsernameInUse' }, {}),
		USERNAME_INVALID: intl.formatMessage({ id: 'Admin.User.errorUsernameInvalid' }, {}),
		UNEXPECTED_ERROR: intl.formatMessage({ id: 'Admin.User.errorUnexpected' }, {}),
		PASSWORD_DONT_MATCH: intl.formatMessage({ id: 'Admin.User.errorPasswordsDontMatch' }, {})
	};

	const getError = (code) => (code ? errorsMappings[code] || errorsMappings.UNEXPECTED_ERROR : undefined);

	return (
		<form>
			<Grid container spacing={32}>
				<Grid item container spacing={8} justify="space-between" alignItems="center">
					<Grid item>
						<Typography variant="h5">
							<FormattedMessage id="Admin.User.add" defaultMessage="Add new user" />
						</Typography>
					</Grid>
					{errors.form ? (
						<Grid item>
							<Typography color="error" variant="subtitle1">
								{getError(errors.form)}
							</Typography>
						</Grid>
					) : (
						undefined
					)}
				</Grid>
				<Grid item xs={12} sm={12}>
					<TextField
						required
						id="username"
						label={<FormattedMessage id="Admin.User.labelUsername" defaultMessage="Username" />}
						fullWidth
						error={!!errors.username}
						helperText={getError(errors.username)}
						disabled={disabled}
						value={user.username || ''}
						onChange={(event) => onUsernameUpdate(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} sm={12}>
					<TextField
						required
						id="email"
						label={<FormattedMessage id="Admin.User.labelEMail" defaultMessage="E-Mail" />}
						fullWidth
						error={!!errors.email}
						helperText={getError(errors.email)}
						disabled={disabled}
						value={user.email || ''}
						onChange={(event) => onEmailUpdate(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						id="firstName"
						label={<FormattedMessage id="Admin.User.labelFirstName" defaultMessage="First name" />}
						fullWidth
						disabled={disabled}
						value={user.firstName || ''}
						onChange={(event) => onFirstNameUpdate(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						id="lastName"
						label={<FormattedMessage id="Admin.User.labelLastName" defaultMessage="Last name" />}
						fullWidth
						disabled={disabled}
						value={user.lastName || ''}
						onChange={(event) => onLastNameUpdate(event.target.value)}
					/>
				</Grid>
				{additionalFields.map((field) => (
					<Grid item xs={12} sm={12} key={field.id}>
						<FormControl style={{ width: '100%' }}>
							<InputLabel htmlFor={field.id}>
								<DynamicFormattedMessage id={field.label} default={field.id} />
							</InputLabel>
							<Select
								id={field.id}
								disabled={disabled}
								value={props.user[field.id] || ''}
								onChange={(event) => onFieldUpdate(field.id, event.target.value)}
							>
								{field.options.map((value) => (
									<MenuItem key={value.id} value={value.id}>
										{value.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				))}
				<Grid item xs={12}>
					<TextField
						required
						id="password"
						label={<FormattedMessage id="Admin.User.labelPassword" defaultMessage="Password" />}
						type="password"
						fullWidth
						disabled={disabled}
						error={!!errors.password}
						value={user.password || ''}
						onChange={(event) => onPasswordUpdate(event.target.value)}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						required
						id="password-confirmation"
						type="password"
						label={
							<FormattedMessage id="Admin.User.labelPasswordConfirm" defaultMessage="Confirm password" />
						}
						error={!!errors.password}
						helperText={getError(errors.password)}
						fullWidth
						disabled={disabled}
						value={passwordConfirmation || ''}
						onChange={(event) => onPasswordConfirmationUpdate(event.target.value)}
					/>
				</Grid>
				<Grid container item spacing={16} xs={12} justify="flex-end" direction="row">
					<Grid item>
						<Button variant="outlined" disabled={disabled} onClick={onCancel}>
							<FormattedMessage id="Admin.User.buttonCancel" defaultMessage="Cancel" />
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant="contained"
							color="primary"
							onClick={onSubmit}
							disabled={pristine || !valid || disabled}
						>
							<FormattedMessage id="Admin.User.buttonAdd" defaultMessage="Add" />
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</form>
	);
};

CreateUserForm.propTypes = {
	user: userShape.isRequired,
	errors: PropTypes.shape({
		username: PropTypes.string,
		email: PropTypes.string,
		password: PropTypes.string
	}).isRequired,
	valid: PropTypes.bool.isRequired,
	disabled: PropTypes.bool.isRequired,
	passwordConfirmation: PropTypes.string.isRequired,
	pristine: PropTypes.bool.isRequired,
	intl: PropTypes.shape({
		formatMessage: PropTypes.func.isRequired
	}).isRequired,
	onFieldUpdate: PropTypes.func.isRequired,
	onUsernameUpdate: PropTypes.func.isRequired,
	onEmailUpdate: PropTypes.func.isRequired,
	onFirstNameUpdate: PropTypes.func.isRequired,
	onLastNameUpdate: PropTypes.func.isRequired,
	onPasswordUpdate: PropTypes.func.isRequired,
	onPasswordConfirmationUpdate: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
};
