// useEffect(() => {
//   const fetchChecklist = async () => {
//       try {
//           const response = await axios.get(`/api/project/${projectId}/checklist`);
//           console.log('Checklist data:', response.data); // Log data
//           setChecklist(response.data);
//           setLoading(false);
//       } catch (error) {
//           console.error('Error fetching checklist:', error);
//       }
//   };
//   fetchChecklist();
// }, [projectId]);
