import React from 'react'
import Form from "./components/Form"
import Admin from "./components/Admin"
import Emp from "./components/EmployeeComponent"
function page() {
  return (
    <div> <div className=' min-h-max'><Emp></Emp></div>
    <Form></Form>
    <div><Admin></Admin></div>
   
    
    </div>
  )
}

export default page
