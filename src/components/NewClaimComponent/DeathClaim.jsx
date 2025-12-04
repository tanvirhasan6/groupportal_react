import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import DatePickerInput from "../MyDatePicker/DatePickerInput";
import SearchableSelect from "../SearchableSelect";
import { useUser } from "../../context/UserContext"
import { replace, useNavigate } from "react-router-dom"

export default function DeathClaim() {

    const user = useUser()

    return (
        <div>DeathClaim</div>
    )
}
