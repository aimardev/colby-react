import React, { useCallback, useState } from 'react'
import { Button, Card, Label, Select, TextInput, ToggleSwitch } from 'flowbite-react'
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { PopoverPicker } from '../../common/PopoverPicker';
import { useChartContext } from '../../../hooks/useChartContext';

const LineAnnotation = () => {

    const { state: { forms, data }, dispatch, onDownloadChart, onClearCache, onAddLineAnnotation } = useChartContext()
    const { control, register, watch } = useFormContext()
    const activeItem = watch('annotation.line.ativeItem')
    const lineEnabled = watch('annotation.line.enabled')
    const line = watch('annotation.line')

    const handleAddClick = () => {
        console.log('[handleAddClick]', line)
    }

    return (
        <Card className="w-full">
            <Controller
                name="annotation.line.enabled"
                control={control}
                render={({ field: { value, onChange } }) => {
                    return <ToggleSwitch label="Line Annotation" checked={value} onChange={onChange} />
                }}
            />
            {lineEnabled && <div className="w-full grid grid-cols-3 gap-3 my-4 p-2">
                <div className="col-span-3">
                    <h3 className='underline text-2xl uppercase font-bold'> {lineEnabled ? 'New Line' : 'Edit Line'}</h3>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center">
                        <Label className="inline mr-2" htmlFor="annotationAxisSelect" value="Axis:" />
                        <Select id="annotationAxisSelect" {...register('annotation.line.axis')}>
                            <option value="x">X</option>
                            <option value="y">Y</option>
                        </Select>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center">
                        <Label className="inline mr-2 shrink-0" htmlFor="axis-position" value="Axis Position:" />
                        <TextInput id="axis-position" type="text" placeholder="10" {...register("annotation.line.position")} />
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center">
                        <Label className="inline mr-2 shrink-0" htmlFor="anno-linestyle" value="Line Style:" />
                        <Select id="anno-linestyle" {...register("annotation.line.style")} >
                            <option value='none'>None</option>
                            <option value='dashed'>Dashed</option>
                            <option value='wave'>Wave</option>
                        </Select>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center">
                        <Label className="inline mr-2 shrink-0" htmlFor="axis-label" value="Label:" />
                        <TextInput id="axis-label" type="text" placeholder="Default Label" {...register("annotation.line.label")} />
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center h-full">
                        <Label className="inline mr-2 shrink-0" htmlFor="anno-linecolor" value="Line Color:" />
                        <Controller
                            name="annotation.line.color"
                            control={control}
                            render={({ field: { value, onChange } }) => {
                                return <PopoverPicker color={value} onChange={onChange} />;
                            }}
                        />
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex items-center">
                        <Label className="inline mr-2 shrink-0" htmlFor="anno-line-thickness" value="Line Thickness:" />
                        <TextInput id="anno-line-thickness" type="text" placeholder="10" {...register("annotation.line.thickness")} />
                    </div>
                </div>
                {
                    lineEnabled && <div className="col-span-3">
                        <div className="flex items-center">
                            <Button onClick={handleAddClick}> Add </Button>
                        </div>
                    </div>
                }
            </div>}
        </Card>
    );

}

export default LineAnnotation