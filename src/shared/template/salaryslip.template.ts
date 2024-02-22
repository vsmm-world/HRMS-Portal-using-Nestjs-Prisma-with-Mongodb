export class SalarySlipTemplate {
  static template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="Content-Style-Type" content="text/css" />
    <title>Employee Salary Slip</title>
    <style type="text/css">
      body {
        font-family: 'Arial', sans-serif;
        font-size: 12pt;
        margin: 0;
        padding: 0;
        background-color: #f0f0f0; /* Light Grey Background */
      }
  
      .container {
        width: 80%;
        margin: 20px auto;
        background-color: #ffffff; /* White Container */
        padding: 20px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
  
      h1 {
        color: #333; /* Dark Text Color */
        text-align: center;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
      }
  
      p {
        margin: 0;
        line-height: 1.5;
      }
  
      .user-details {
        margin-top: 20px;
      }
  
      .salary-details {
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Employee Salary Slip</h1>
  
      <div class="user-details">
        <p><span>First Name:</span> {{employee.firstName}}</p>
        <p><span>Last Name:</span> {{employee.lastName}}</p>
        <p><span>Employee ID:</span> {{employee.id}}</p>
        <p><span>Email:</span> {{employee.email}}</p>
      </div>
  
      <div class="salary-details">
        <h2>Salary Details</h2>
        <p><span>Basic Salary:</span> {{salary.basic}}</p>
        <p><span>Allowances:</span> {{salary.allowances}}</p>
        <p><span>Deductions:</span> {{salary.deductions}}</p>
        <p><span>Net Salary:</span> {{salary.netSalary}}</p>
      </div>
    </div>
  </body>
  </html>
  
  `;
}
