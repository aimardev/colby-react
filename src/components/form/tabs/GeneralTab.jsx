import React, { useEffect, useState } from 'react'
import { Checkbox, Label, Select, ToggleSwitch } from 'flowbite-react';
import { Controller, useFormContext } from "react-hook-form"

import ColbyTextInput from '../elements/ColbyTextInput';
import { useChartContext } from '../../../hooks/useChartContext';
import { UPDATE_DATA_RANGE } from '../../../context/ChartContext';

const GeneralTab = ({ keyLabels }) => {
    const { control, register, watch } = useFormContext()
    const xAxis = watch('general.xAxis')
    const dataRange = watch('dataRange')
    const { dispatch } = useChartContext()
    const [pastDataRange, setPastDataRange] = useState(dataRange)


    useEffect(() => {
        const dateRangePattern = /^[A-Za-z]{1,2}[0-9]+\:[A-Za-z]{1,2}[0-9]+$/;
        // data range
        if (pastDataRange == dataRange) return;
        if (dataRange.trim() == '' || dateRangePattern.test(dataRange)) {
            setPastDataRange(pastDataRange)
            dispatch({ type: UPDATE_DATA_RANGE, data: dataRange })
        }

    }, [dataRange, dispatch])

    return (
        <div className="w-full min-h-32 grid grid-cols-3 gap-4 px-8">
            <div className="col-span-1">
                <div className="flex items-center">
                    <Label className="inline mr-2" htmlFor="title" value="Title:" />
                    <ColbyTextInput
                        type="text"
                        control={control}
                        name="general.title"
                        placeholder="Default title"
                    />
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex items-center">
                    <Label className="inline mr-2" htmlFor="generalXAxisSelect" value="X-Axis Dataset:" />
                    <Select id="generalXAxisSelect" {...register('general.xAxis')}>
                        {keyLabels.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
                    </Select>
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex items-center">
                    <div className="flex items-center">
                        <Label className="inline mr-2" htmlFor="plotted-datasets" value="Plotted Datasets:" />
                        <div className="flex gap-3">
                            {keyLabels.map(({ key, label }) => key != xAxis && <div key={key}><Checkbox  {...register(`general.yAxis.${key}`)} /> <Label value={label} /> </div>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex items-center">
                    <Controller
                        name="general.stacked"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            return <ToggleSwitch label="Stacked" checked={value} onChange={onChange} />
                        }}
                    />
                </div>
            </div>
            <div className="col-span-2">
                <div className="flex items-center">
                    <Controller
                        name="general.switchRowColumn"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            return <ToggleSwitch label="Switch rows and columns" checked={value} onChange={onChange} />
                        }}
                    />
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex items-center">
                    <Controller
                        name="general.showLabels"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            return <ToggleSwitch label="Show Labels" checked={value} onChange={onChange} />
                        }}
                    />
                </div>
            </div>
            <div className="col-span-1">
                <div className="flex items-center">
                    <Controller
                        name="general.showLegend"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            return <ToggleSwitch label="Show Legend" checked={value} onChange={onChange} />
                        }}
                    />
                </div>
            </div>
            <div className="col-span-3">
                <div className="flex items-center">
                    <Label className="inline mr-2" htmlFor="dataRange" value="Data Range:" />
                    <ColbyTextInput
                        type="text"
                        control={control}
                        name="dataRange"
                    />
                </div>
            </div>
        </div>
    );
}


export default GeneralTab