import React, { useState, useEffect } from 'react';
import { useLanguage } from "../languagecontext";
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Rating,
  Typography,
  Paper,
  Divider
} from '@mui/material';

const FormSubmit = ({ formFields, onFieldValuesChange }) => {
    const { t } = useLanguage();
  const [fieldValues, setFieldValues] = useState({});

  // Initialize field values when formFields change
  useEffect(() => {
    const initialValues = {};
    formFields.forEach(field => {
      if (field.type === 'checkbox') {
        initialValues[field.id] = field.options.reduce((acc, opt) => {
          acc[opt.value] = false;
          return acc;
        }, {});
      } else if (field.type === 'radio' && field.options.length > 0) {
        initialValues[field.id] = field.options[0].value;
      } else {
        initialValues[field.id] = '';
      }
    });
    setFieldValues(initialValues);
  }, [formFields]);

  const handleValueChange = (fieldId, value) => {
    const newValues = {
      ...fieldValues,
      [fieldId]: value
    };
    setFieldValues(newValues);
    if (onFieldValuesChange) {
      onFieldValuesChange(newValues);
    }
  };

  const handleCheckboxChange = (fieldId, optionValue, isChecked) => {
    const newCheckboxValues = {
      ...fieldValues[fieldId],
      [optionValue]: isChecked
    };
    handleValueChange(fieldId, newCheckboxValues);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.id}
            label={field.label || 'Text Field'}
            variant="outlined"
            fullWidth
            margin="normal"
            required={field.required}
            value={fieldValues[field.id] || ''}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
          />
        );

      case 'rating':
        return (
          <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || 'Rating'} {field.required && '*'}
            </Typography>
            <Rating
              name={`rating-${field.id}`}
              precision={0.5}
              value={Number(fieldValues[field.id]) || 0}
              onChange={(e, newValue) => handleValueChange(field.id, newValue)}
            />
          </Box>
        );

      case 'checkbox':
        return (
          <FormControl key={field.id} component="fieldset" sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || 'Checkbox'} {field.required && '*'}
            </Typography>
            {field.options.length > 0 ? (
              field.options.map((option, index) => (
                <FormControlLabel
                  key={`${field.id}-${index}`}
                  control={
                    <Checkbox
                      name={`${field.id}-${index}`}
                      checked={fieldValues[field.id]?.[option.value] || false}
                      onChange={(e) => handleCheckboxChange(
                        field.id,
                        option.value,
                        e.target.checked
                      )}
                    />
                  }
                  label={option.label || `Option ${index + 1}`}
                />
              ))
            ) : (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fieldValues[field.id] || false}
                    onChange={(e) => handleValueChange(field.id, e.target.checked)}
                  />
                }
                label="Checkbox option"
              />
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.id} component="fieldset" sx={{ mt: 2, mb: 1 }}>
            <Typography component="legend">
              {field.label || 'Radio Group'} {field.required && '*'}
            </Typography>
            <RadioGroup
              value={fieldValues[field.id] || ''}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
            >
              {field.options.length > 0 ? (
                field.options.map((option, index) => (
                  <FormControlLabel
                    key={`${field.id}-${index}`}
                    value={option.value}
                    control={<Radio />}
                    label={option.label || `Option ${index + 1}`}
                  />
                ))
              ) : (
                <FormControlLabel
                  value="option1"
                  control={<Radio />}
                  label="Radio option"
                />
              )}
            </RadioGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box
        sx={{
        width: '100%',
        height: 'auto',
        boxSizing: 'border-box',
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
        borderRadius: '10px',
        padding: '10px',
        gap: "2px",
    }}
    >    
      {formFields.length > 0 ? (
        formFields.map(field => renderField(field))
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t("no_fields_preview_message")}
        </Typography>
      )}
    </Box>
  );
};

export default FormSubmit;