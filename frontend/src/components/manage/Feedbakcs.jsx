import React, { useEffect, useState } from 'react';
import FormPreview from '../FormPreview';
import { useLanguage } from "../../languagecontext";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Rating,
  Typography,
  Divider,
  Paper,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from "axios";

const FormBuilder = () => {
  const { t } = useLanguage();

  
  const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
  const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
  const [verifyAlert, setVerifyAlert] = useState("error");
  const handleVerificationAlertClose = () => {
      setShowsVerifificationAlert(false);
  };

  const [formFields, setFormFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const types = ["cold_feedback", "hot_feedback"];
  const [formType, setFormType] = useState("cold_feedback");

  const submitForm = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/dynamicform/changeforms", {
        type: formType,
        fields: formFields,
      });
      console.log('Form submitted successfully:', response.data);
      setVerifyAlert("success");
      setVerifyAlertMessage("form_updated_successfully");
      setShowsVerifificationAlert(true);
      return response.data;
    } catch (error) {
      console.error('Error submitting form:', error);
      setVerifyAlert("error");
      setVerifyAlertMessage("error updating form");
      setShowsVerifificationAlert(true);
      throw error;
    }
  };

  const fetchForms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dynamicform/forms")
      const form =  response.data.forms.filter((form) => form.type === formType);
      setFormFields(form[0].fields);
    } catch (error) {
      console.error('Error getting forms', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchForms();
  }, [formType]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'rating', label: 'Rating' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Group' },
  ];

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFormFields(prevFields => [...prevFields, newField]);
  };

  const updateField = (id, updates) => {
    setFormFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (id) => {
    setFormFields(prevFields => prevFields.filter(field => field.id !== id));
  };

  const addOption = (fieldId) => {
    setFormFields(prevFields => 
      prevFields.map(field => {
        if (field.id === fieldId) {
          return {
            ...field,
            options: [...field.options, { label: '', value: `option_${Date.now()}` }]
          };
        }
        return field;
      })
    );
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFormFields(prevFields => 
      prevFields.map(field => {
        if (field.id === fieldId) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], label: value };
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };

  const deleteOption = (fieldId, optionIndex) => {
    setFormFields(prevFields => 
      prevFields.map(field => {
        if (field.id === fieldId) {
          const newOptions = [...field.options];
          newOptions.splice(optionIndex, 1);
          return { ...field, options: newOptions };
        }
        return field;
      })
    );
  };

  const renderField = (field) => {
    const isRadioOrCheckbox = field.type === 'radio' || field.type === 'checkbox';

    return (
      <Paper key={field.id} sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <TextField
              label="Field Label"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={field.type}
                label="Field Type"
                onChange={(e) => updateField(field.id, { type: e.target.value, options: [] })}
              >
                {fieldTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
              }
              label="Required"
            />
          </Box>
          
          <IconButton 
            onClick={() => deleteField(field.id)}
            sx={{
              color: "#EA9696",
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        {isRadioOrCheckbox && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Options</Typography>
            {field.options.map((option, index) => (
              <Box key={option.value} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TextField
                  value={option.label}
                  onChange={(e) => updateOption(field.id, index, e.target.value)}
                  size="small"
                  fullWidth
                  label={`Option ${index + 1}`}
                />
                <IconButton onClick={() => deleteOption(field.id, index)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              onClick={() => addOption(field.id)}
              startIcon={<AddIcon />}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Option
            </Button>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        width: "96%",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        justifyContent: "center",
        position: "absolute",
        top: '15%',
        left: "2%",
        gap : "20px",
      }}
    >
    <Box
        sx={{
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: '10px',
        padding: '30px',
        gap: "10px",
    }}
    >
      <Typography 
        sx={{
          fontSize: 34,
          fontWeight: "bold",
          textAlign: "center",
          letterSpacing: 0.2,
          lineHeight: 1,
          userSelect: "none",
          cursor: "pointer",
          color: "#2CA8D5",
          marginLeft: 5,
      }}>
        {t("manage_feedbacks")}
      </Typography>
      <FormControl size="small" sx={{ mb: 1, mt: 2 }}>
        <InputLabel>{t("feedback_type")}</InputLabel>
        <Select
          value={formType}
          label={t("feedback_type")}
          onChange={(e) => setFormType(e.target.value)}
        >
          {types.map((type) => (
            <MenuItem key={type} value={type}>
              {t(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {formFields.length > 0 ? (
        formFields.map(field => renderField(field))
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
          {t("no_fields_message")}
        </Typography>
      )}
      <Box 
          sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
          }}
      >
          <Button sx={{
              color: 'white',
              backgroundColor: '#2CA8D5',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
              width: 'auto',
              height: '40px',
              marginTop: '10px',
              padding: "10px",
              textTransform: "none",
              '&:hover': {
                  backgroundColor: '#76C5E1',
                  color: 'white',
              },
          }} 
          onClick={addField}
          startIcon={<AddIcon />}
          >
              {t("add_field")}
          </Button>
          <Button sx={{
              color: 'white',
              backgroundColor: '#2CA8D5',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
              width: 'auto',
              height: '40px',
              marginTop: '10px',
              padding: "10px",
              textTransform: "none",
              '&:hover': {
                  backgroundColor: '#76C5E1',
                  color: 'white',
              },
          }}
          onClick={submitForm} 
          >
              {t("save")}
          </Button>
      </Box>
    </Box>
    <Box
        sx={{
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: '10px',
        padding: '30px',
        gap: "10px",
        position: "sticky",
        top: '0px',
    }}
    >
      <Typography variant="h6" color="text.primary">
        {t("form_preview")}
      </Typography>
      <FormPreview 
        formFields={formFields} 
        onFieldValuesChange={setFieldValues} 
      />
    </Box>
    <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
        <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
            {t(verifyAlertMessage)}
        </Alert>
    </Snackbar>
    </Box>
  );
};

export default FormBuilder;